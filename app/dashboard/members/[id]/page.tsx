"use client";

import DeleteMemberButton from "@/components/DeleteMemberButton";
import MemberDetailContent from "@/components/MemberDetailContent";
import { useUser } from "@/components/UserProvider";
import {
  usePersonDetailQuery,
  usePersonPrivateDetailQuery,
} from "@/hooks/queries/usePersonsQuery";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function MemberDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id ?? "";
  const { isAdmin, isEditor } = useUser();
  const canEdit = isAdmin || isEditor;

  const {
    data: person,
    isLoading: isPersonLoading,
    error: personError,
  } = usePersonDetailQuery(id);
  const { data: privateDataQuery } = usePersonPrivateDetailQuery(
    id,
    Boolean(id) && isAdmin,
  );
  const privateData = (privateDataQuery ?? null) as Record<string, unknown> | null;

  if (isPersonLoading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center py-16">
        <div className="size-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (personError || !person) {
    return (
      <div className="flex-1 w-full relative flex flex-col pb-8">
        <div className="w-full relative z-20 py-4 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex items-center gap-3">
          <Link
            href="/dashboard/members"
            className="p-2 -ml-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="title">Chi Tiết Thành Viên</h1>
        </div>
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 w-full flex-1">
          <div className="bg-white/60 rounded-2xl shadow-sm border border-stone-200/60 overflow-hidden p-8 text-center text-stone-600">
            {personError instanceof Error
              ? personError.message
              : "Không thể tải thông tin thành viên."}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full relative flex flex-col pb-8">
      {/* Decorative background blurs */}
      {/* <div className="absolute -top-[20%] left-0 w-[500px] h-[500px] bg-amber-200/20 rounded-full blur-[120px] pointer-events-none" /> */}
      {/* <div className="absolute top-[40%] right-0 w-[400px] h-[400px] bg-stone-300/20 rounded-full blur-[100px] pointer-events-none" /> */}

      <div className="w-full relative z-20 py-4 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/members"
            className="p-2 -ml-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-full transition-colors"
            title="Quay lại danh sách"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <h1 className="title">Chi Tiết Thành Viên</h1>
        </div>
        {canEdit && (
          <div className="flex items-center gap-2.5">
            <Link
              href={`/dashboard/members/${id}/edit`}
              className="px-4 py-2 bg-stone-100/80 text-stone-700 rounded-lg hover:bg-stone-200 hover:text-stone-900 font-medium text-sm transition-all shadow-sm"
            >
              Chỉnh sửa
            </Link>
            <DeleteMemberButton memberId={id} />
          </div>
        )}
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 relative z-10 w-full flex-1">
        <div className="bg-white/60 rounded-2xl shadow-sm border border-stone-200/60 overflow-hidden hover:shadow-md transition-shadow duration-300">
          <MemberDetailContent
            person={person}
            privateData={privateData}
            isAdmin={isAdmin}
            canEdit={canEdit}
          />
        </div>
      </main>
    </div>
  );
}
