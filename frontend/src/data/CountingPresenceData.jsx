import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const cards = [
  {
    fechaInicio: "2025-05-19",
    fechaTermino: "2025-05-19",
    horaInicio: "06:00",
    horaTermino: "18:00",
    lugar: "Zona Norte",
    ultimoRegistro: "2025-04-19T17:45",
    registradoPor: "Juan Pérez",
  },
  {
    fechaInicio: "2025-05-20",
    fechaTermino: "2025-05-20",
    horaInicio: "07:00",
    horaTermino: "19:00",
    lugar: "Zona Sur",
    ultimoRegistro: "2025-04-20T18:00",
    registradoPor: "Ana Gómez",
  },
  // Puedes seguir agregando más objetos similares
];

const CoutingPresenceCarousel = () => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0); // 1: derecha, -1: izquierda

  const handleNext = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const slideVariants = {
    initial: (direction) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    animate: { x: 0, opacity: 1 },
    exit: (direction) => ({
      x: direction > 0 ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  return (
    <div className="relative w-full flex justify-center items-center">
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-gray-200 hover:bg-gray-300 rounded-full p-2 shadow-md"
      >
        <ChevronLeft />
      </button>

      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={index}
          custom={direction}
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="p-6 space-y-6"
        >
          <section className="border p-4 rounded-lg shadow-md bg-white max-w-xl space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de inicio</label>
                <input
                  type="date"
                  value={cards[index].fechaInicio}
                  readOnly
                  className="mt-1 block w-full border rounded-md px-3 py-2 bg-gray-100 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de término</label>
                <input
                  type="date"
                  value={cards[index].fechaTermino}
                  readOnly
                  className="mt-1 block w-full border rounded-md px-3 py-2 bg-gray-100 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Hora de inicio</label>
                <input
                  type="time"
                  value={cards[index].horaInicio}
                  readOnly
                  className="mt-1 block w-full border rounded-md px-3 py-2 bg-gray-100 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Hora de término</label>
                <input
                  type="time"
                  value={cards[index].horaTermino}
                  readOnly
                  className="mt-1 block w-full border rounded-md px-3 py-2 bg-gray-100 text-black"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Lugar</label>
                <input
                  type="text"
                  value={cards[index].lugar}
                  readOnly
                  className="mt-1 block w-full border rounded-md px-3 py-2 bg-gray-100 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Último registro</label>
                <input
                  type="datetime-local"
                  value={cards[index].ultimoRegistro}
                  readOnly
                  className="mt-1 block w-full border rounded-md px-3 py-2 bg-gray-100 text-black"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Registrado por</label>
                <input
                  type="text"
                  value={cards[index].registradoPor}
                  readOnly
                  className="mt-1 block w-full border rounded-md px-3 py-2 bg-gray-100 text-black"
                />
              </div>
            </div>
          </section>
        </motion.div>
      </AnimatePresence>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-200 hover:bg-gray-300 rounded-full p-2 shadow-md"
      >
        <ChevronRight />
      </button>
    </div>
  );
};

export default CoutingPresenceCarousel;
