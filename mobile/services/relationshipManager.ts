import { getSupabaseClient } from "@/lib/supabase";
import { Gender, Person, RelationshipType } from "@/types";
import { Database } from "@/types/database.types";
import { createPerson, updatePerson } from "@/services/persons";

export type RelationshipDirection =
  | "parent"
  | "child"
  | "spouse"
  | "child_in_law";

export interface EnrichedRelationship {
  id: string;
  type: RelationshipType;
  direction: RelationshipDirection;
  targetPerson: Person;
  note: string | null;
}

type RelationshipRow = Database["public"]["Tables"]["relationships"]["Row"];
type RelationshipInsert = Database["public"]["Tables"]["relationships"]["Insert"];
type PersonInsert = Database["public"]["Tables"]["persons"]["Insert"];
type PersonUpdate = Database["public"]["Tables"]["persons"]["Update"];

interface RelationshipWithTarget {
  id: string;
  type: RelationshipType;
  note: string | null;
  target: Person;
}

interface MarriageWithPersons extends RelationshipRow {
  person_a_data: Person | null;
  person_b_data: Person | null;
}

export async function fetchEnrichedRelationships(
  personId: string,
): Promise<EnrichedRelationship[]> {
  const supabase = getSupabaseClient();

  const { data: relsA, error: errA } = await supabase
    .from("relationships")
    .select("*, target:persons!person_b(*)")
    .eq("person_a", personId);

  const { data: relsB, error: errB } = await supabase
    .from("relationships")
    .select("*, target:persons!person_a(*)")
    .eq("person_b", personId);

  if (errA || errB) {
    throw new Error(errA?.message ?? errB?.message ?? "Không tải được quan hệ.");
  }

  const relsAData = (relsA ?? []) as unknown as RelationshipWithTarget[];
  const relsBData = (relsB ?? []) as unknown as RelationshipWithTarget[];
  const formattedRels: EnrichedRelationship[] = [];

  for (const r of relsAData) {
    if (!r.target) continue;
    let direction: RelationshipDirection = "spouse";
    if (r.type === "marriage") direction = "spouse";
    else if (r.type === "biological_child" || r.type === "adopted_child")
      direction = "child";

    formattedRels.push({
      id: r.id,
      type: r.type,
      direction,
      targetPerson: r.target,
      note: r.note,
    });
  }

  for (const r of relsBData) {
    if (!r.target) continue;
    let direction: RelationshipDirection = "spouse";
    if (r.type === "marriage") direction = "spouse";
    else if (r.type === "biological_child" || r.type === "adopted_child")
      direction = "parent";

    formattedRels.push({
      id: r.id,
      type: r.type,
      direction,
      targetPerson: r.target,
      note: r.note,
    });
  }

  const childrenIds = formattedRels
    .filter((r) => r.direction === "child")
    .map((r) => r.targetPerson.id);

  if (childrenIds.length > 0) {
    const { data: childrenMarriages } = await supabase
      .from("relationships")
      .select(
        "*, person_a_data:persons!person_a(*), person_b_data:persons!person_b(*)",
      )
      .eq("type", "marriage")
      .or(
        `person_a.in.(${childrenIds.join(",")}),person_b.in.(${childrenIds.join(",")})`,
      );

    const marriages =
      (childrenMarriages ?? []) as unknown as MarriageWithPersons[];

    for (const m of marriages) {
      const isAChild = childrenIds.includes(m.person_a);
      const childPerson = isAChild ? m.person_a_data : m.person_b_data;
      const spousePerson = isAChild ? m.person_b_data : m.person_a_data;

      if (!spousePerson || !childPerson) continue;

      let noteLabel = `Vợ/chồng của ${childPerson.full_name}`;
      if (spousePerson.gender === "female")
        noteLabel = `Con dâu (vợ của ${childPerson.full_name})`;
      if (spousePerson.gender === "male")
        noteLabel = `Con rể (chồng của ${childPerson.full_name})`;
      if (m.note) noteLabel += ` - ${m.note}`;

      formattedRels.push({
        id: `${m.id}_inlaw`,
        type: "marriage",
        direction: "child_in_law",
        targetPerson: spousePerson,
        note: noteLabel,
      });
    }
  }

  return formattedRels;
}

export async function searchPersonsForRelationship(
  personId: string,
  searchTerm: string,
): Promise<Person[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("persons")
    .select("*")
    .ilike("full_name", `%${searchTerm}%`)
    .neq("id", personId)
    .limit(8);

  if (error) throw new Error(error.message);
  return (data ?? []) as Person[];
}

export async function fetchRecentPersonsForRelationship(
  personId: string,
): Promise<Person[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("persons")
    .select("*")
    .neq("id", personId)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw new Error(error.message);
  return (data ?? []) as Person[];
}

async function autoUpdateTargetPerson(
  person: Person,
  targetId: string,
  direction: "parent" | "child" | "spouse",
) {
  const supabase = getSupabaseClient();
  const { data: targetPerson } = await supabase
    .from("persons")
    .select("generation, is_in_law")
    .eq("id", targetId)
    .maybeSingle();

  const target = targetPerson as Pick<Person, "generation" | "is_in_law"> | null;
  if (!target) return;

  const updates: PersonUpdate = {};
  if (target.generation == null && person.generation != null) {
    if (direction === "child") updates.generation = person.generation + 1;
    else if (direction === "parent") updates.generation = person.generation - 1;
    else if (direction === "spouse") updates.generation = person.generation;
  }

  if (target.is_in_law == null) {
    if (direction === "child" || direction === "parent") updates.is_in_law = false;
    else if (direction === "spouse")
      updates.is_in_law = person.is_in_law === true ? false : true;
  }

  if (Object.keys(updates).length > 0) {
    await updatePerson(targetId, updates);
  }
}

export async function createRelationshipLink(params: {
  person: Person;
  targetId: string;
  direction: "parent" | "child" | "spouse";
  childType: RelationshipType;
  note: string | null;
}): Promise<void> {
  const supabase = getSupabaseClient();
  let personA = params.person.id;
  let personB = params.targetId;

  if (params.direction === "parent") {
    personA = params.targetId;
    personB = params.person.id;
  } else if (params.direction === "child") {
    personA = params.person.id;
    personB = params.targetId;
  }

  let type: RelationshipType = "biological_child";
  if (params.direction === "spouse") type = "marriage";
  else if (params.childType === "adopted_child") type = "adopted_child";

  const payload: RelationshipInsert = {
    person_a: personA,
    person_b: personB,
    type,
    note: params.note,
  };

  const table = supabase.from("relationships") as unknown as {
    insert: (
      values: RelationshipInsert,
    ) => Promise<{ error: { message: string } | null }>;
  };

  const { error } = await table.insert(payload);
  if (error) throw new Error(error.message);

  await autoUpdateTargetPerson(
    params.person,
    params.targetId,
    params.direction,
  );
}

export async function deleteRelationshipById(relId: string): Promise<void> {
  if (relId.endsWith("_inlaw")) {
    throw new Error("Không thể xóa quan hệ con dâu/rể từ đây.");
  }
  const supabase = getSupabaseClient();
  const { error } = await supabase.from("relationships").delete().eq("id", relId);
  if (error) throw new Error(error.message);
}

export interface BulkChildRow {
  name: string;
  gender: Gender;
  birthYear: string;
  birthOrder: string;
}

export async function bulkCreateChildren(params: {
  person: Person;
  spouseId: string | null;
  children: BulkChildRow[];
}): Promise<{ success: number; total: number }> {
  let successCount = 0;
  const valid = params.children.filter((c) => c.name.trim() !== "");

  for (const child of valid) {
    const personPayload: PersonInsert = {
      full_name: child.name.trim(),
      gender: child.gender,
      is_in_law: false,
      generation:
        params.person.generation != null
          ? params.person.generation + 1
          : null,
      birth_year:
        child.birthYear.trim() !== ""
          ? Number.parseInt(child.birthYear, 10)
          : null,
      birth_order:
        child.birthOrder.trim() !== ""
          ? Number.parseInt(child.birthOrder, 10)
          : null,
    };

    const newPerson = await createPerson({
      full_name: personPayload.full_name,
      gender: personPayload.gender,
      birth_year: personPayload.birth_year ?? null,
      birth_month: null,
      birth_day: null,
      death_year: null,
      death_month: null,
      death_day: null,
      death_lunar_year: null,
      death_lunar_month: null,
      death_lunar_day: null,
      is_deceased: false,
      is_in_law: false,
      birth_order: personPayload.birth_order ?? null,
      generation: personPayload.generation ?? null,
      other_names: null,
      avatar_url: null,
      note: null,
    });

    const supabase = getSupabaseClient();
    const table = supabase.from("relationships") as unknown as {
      insert: (
        values: RelationshipInsert,
      ) => Promise<{ error: { message: string } | null }>;
    };

    const mainRel: RelationshipInsert = {
      person_a: params.person.id,
      person_b: newPerson.id,
      type: "biological_child",
      note: null,
    };
    const { error: e1 } = await table.insert(mainRel);
    if (e1) continue;

    if (params.spouseId) {
      const secondRel: RelationshipInsert = {
        person_a: params.spouseId,
        person_b: newPerson.id,
        type: "biological_child",
        note: null,
      };
      await table.insert(secondRel);
    }

    successCount++;
  }

  return { success: successCount, total: valid.length };
}

export async function quickCreateSpouse(params: {
  person: Person;
  fullName: string;
  birthYear: string;
  note: string | null;
}): Promise<void> {
  const newSpouseGender: Gender =
    params.person.gender === "male"
      ? "female"
      : params.person.gender === "female"
        ? "male"
        : "female";

  const newPerson = await createPerson({
    full_name: params.fullName.trim(),
    gender: newSpouseGender,
    birth_year:
      params.birthYear.trim() !== ""
        ? Number.parseInt(params.birthYear, 10)
        : null,
    birth_month: null,
    birth_day: null,
    death_year: null,
    death_month: null,
    death_day: null,
    death_lunar_year: null,
    death_lunar_month: null,
    death_lunar_day: null,
    is_deceased: false,
    is_in_law: params.person.is_in_law === true ? false : true,
    birth_order: null,
    generation: params.person.generation,
    other_names: null,
    avatar_url: null,
    note: null,
  });

  const supabase = getSupabaseClient();
  const table = supabase.from("relationships") as unknown as {
    insert: (
      values: RelationshipInsert,
    ) => Promise<{ error: { message: string } | null }>;
  };

  const payload: RelationshipInsert = {
    person_a: params.person.id,
    person_b: newPerson.id,
    type: "marriage",
    note: params.note,
  };

  const { error } = await table.insert(payload);
  if (error) throw new Error(error.message);
}
