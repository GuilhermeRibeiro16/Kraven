import Como_usar from "../sections/Como_usar";
import Contato from "../sections/Contato";
import Servicos from "../sections/Servicos";
import Sobre from "../sections/Sobre";

export default function Home() {
  return (
<>
      <section>
        <Sobre />
        <Servicos />
        <Como_usar />
        <Contato />
      </section>
</>
  );
}
