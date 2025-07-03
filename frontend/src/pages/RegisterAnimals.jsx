import BaseLayout from "../components/BaseLayout";
import RegisterAnimalsForm from "../forms/RegisterAnimalsForm";

const RegisterAnimals = () => {
  return (
    <BaseLayout title="Registro de animales">
      <RegisterAnimalsForm />
    </BaseLayout>
  );
};

export default RegisterAnimals;
