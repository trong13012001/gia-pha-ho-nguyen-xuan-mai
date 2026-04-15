import { DashboardProvider } from "@/components/DashboardContext";
import EventsList from "@/components/EventsList";
import MemberDetailModal from "@/components/MemberDetailModal";
import {
  listCustomEventsServer,
  listPersonsServer,
} from "@/services/supabase/server.service";

export const metadata = {
  title: "Sự kiện gia phả",
};

export default async function EventsPage() {
  const [persons, customEvents] = await Promise.all([
    listPersonsServer(
      "id, full_name, birth_year, birth_month, birth_day, death_year, death_month, death_day, death_lunar_year, death_lunar_month, death_lunar_day, is_deceased, avatar_url",
    ),
    listCustomEventsServer(),
  ]);

  return (
    <DashboardProvider>
      <div className="flex-1 w-full relative flex flex-col pb-12">
        <div className="w-full relative z-20 py-6 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
          <h1 className="title">Sự kiện gia phả</h1>
          <p className="text-stone-500 mt-1 text-sm">
            Sinh nhật, ngày giỗ (âm lịch) và các sự kiện tuỳ chỉnh
          </p>
        </div>

        <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1">
          <EventsList
            persons={persons ?? []}
            customEvents={customEvents ?? []}
          />
        </main>
      </div>

      {/* Modal for member details when clicking an event card */}
      <MemberDetailModal />
    </DashboardProvider>
  );
}
