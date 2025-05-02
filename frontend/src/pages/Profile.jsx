import Navbar from "../components/NavBar";

const Profile = () => {
  return (
    <div>
      <Navbar />
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">Perfil de Usuario</h1>

        <section>
          <h2 className="text-xl font-semibold mb-2">👤 Información del usuario</h2>
          <p className="text-sm text-gray-700">Nombre, correo electrónico y otros datos asociados a la cuenta.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">✏️ Editar datos personales</h2>
          <p className="text-sm text-gray-700">Actualiza tu nombre, correo u otra información relevante.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-2">🔒 Cambiar contraseña</h2>
          <p className="text-sm text-gray-700">Gestiona la seguridad de tu cuenta modificando tu contraseña actual.</p>
        </section>
      </div>
    </div>
  );
};

export default Profile;
