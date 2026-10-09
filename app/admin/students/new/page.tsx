import { AddStudentForm } from "@/components/admin/add-student-form";

export default function NewStudentPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Add Student</h1>
      <p className="text-muted-foreground mb-6 max-w-xl">
        For students on scholarship or who paid offline — creates their
        account directly, with login details you can hand to them. To enroll
        them in a course afterward, go to their student record.
      </p>
      <AddStudentForm />
    </div>
  );
}
