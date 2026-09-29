import { AlumnusForm } from "@/components/admin/alumnus-form";
import { upsertAlumnus } from "@/app/admin/alumni/actions";

export default function NewAlumnusPage() {
  const action = upsertAlumnus.bind(null, null);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add Alumnus</h1>
      <AlumnusForm action={action} submitLabel="Add Alumnus" />
    </div>
  );
}
