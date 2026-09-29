import { TeacherForm } from "@/components/admin/teacher-form";
import { upsertTeacher } from "@/app/admin/teachers/actions";

export default function NewTeacherPage() {
  const action = upsertTeacher.bind(null, null);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add Teacher</h1>
      <TeacherForm action={action} submitLabel="Add Teacher" />
    </div>
  );
}
