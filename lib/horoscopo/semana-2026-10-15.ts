import { withSignInfo, type HoroscopeWeek, type WeekReading } from './core'

/**
 * Semana del 15 al 21 de octubre de 2026.
 * Cielo fijado con efemérides públicas (Time and Date, Cafe Astrology, Astro-Seek):
 * Plutón retoma el movimiento directo en Acuario la madrugada del viernes 16 (02:40 UTC);
 * Marte en Leo forma trígono con Saturno en Aries ese mismo viernes; el Sol en Libra
 * sigue en sextil con Júpiter en Leo hasta el miércoles 21; la Luna llega al cuarto
 * creciente en Capricornio el domingo 18 a las 16:12 UTC; Venus, retrógrada en Escorpio,
 * se cuadra con Plutón el martes 20; Mercurio sigue directo en Escorpio y entra en su
 * retroceso el sábado 24, ya fuera de esta semana.
 */

const readings: WeekReading[] = [
  {
    slug: 'aries',
    hook: 'Un acuerdo se aclara y un plan de grupo vuelve a moverse.',
    titulo: 'Lo que estaba parado vuelve a moverse',
    general:
      'Esta semana notarás que algo que llevaba meses atascado empieza a soltarse: un plan con amigos, un proyecto en grupo, una gestión que dependía de otros. Desde el viernes 16 tienes más claro qué quieres y, sobre todo, más paciencia para conseguirlo sin atropellar a nadie. El domingo 18 es un buen día para decidir qué paso das en el trabajo. Y el martes 20 conviene medir las palabras en una conversación sobre dinero compartido o sobre un tema íntimo: lo que se dice ese día pesa más de la cuenta.',
    relaciones:
      'En pareja, sigue abierta la conversación sobre lo que compartís: gastos, planes, confianza. Esta semana no toca cerrarla a la fuerza, sino escuchar lo que la otra persona no ha dicho todavía. El viernes tendrás la energía justa para hablar sin levantar la voz; aprovéchalo. El martes 20, en cambio, es fácil que una frase pequeña se convierta en una discusión grande. Si notas que sube la tensión, aplaza la charla un día. Si estás soltero o soltera, alguien del pasado puede volver a escribirte; antes de responder, pregúntate qué quieres tú ahora, no lo que querías entonces.',
    trabajo:
      'Tienes ganas de brillar y, por una vez, también la constancia para hacerlo. Es una buena semana para presentar una idea, pedir una reunión o enseñar algo en lo que llevas tiempo trabajando en silencio. El domingo 18 te pedirá que elijas: entre dos caminos, el que te da una responsabilidad clara es el que más te conviene ahora. Un grupo de trabajo o una asociación que parecía dormida vuelve a dar señales de vida a partir del viernes; respóndeles.',
    dinero:
      'Hay un asunto de dinero compartido, una deuda, una herencia o un gasto a medias, que pide una cifra concreta. Ponla sobre la mesa antes del martes, porque ese día las conversaciones sobre dinero se tensan con facilidad. No firmes nada con prisas ni cambies un acuerdo solo porque alguien insiste. Lo que sí puedes hacer es revisar una suscripción o un pago que haces por otra persona y decidir si sigue teniendo sentido.',
    ritmo:
      'Tu energía va a más y eso es bueno, pero cuídate de meterla toda en el mismo día. Sal a andar o a correr el viernes o el sábado, que es cuando mejor te sienta moverte. El domingo por la tarde, en vez de empezar algo nuevo, ordena lo que ya tienes: la agenda, la ropa de la semana, la nevera. El martes, si notas la cabeza muy llena, apaga el móvil una hora antes de dormir. Pequeño, pero funciona.',
    consejo: 'Lo que vuelve a moverse esta semana se mueve mejor con calma. Ten claro lo que quieres y pide ayuda sin pedir permiso.',
  },
  {
    slug: 'tauro',
    hook: 'Tu trabajo se nota más y tu pareja te pide una respuesta.',
    titulo: 'Te ven, y eso tiene consecuencias',
    general:
      'Esta semana tu trabajo se ve más de lo habitual: alguien con poder de decisión se fija en lo que haces, para bien. Desde el viernes 16 se desbloquea un tema profesional que llevaba meses en el aire, y el domingo 18 es buen momento para pensar en qué quieres aprender o hacia dónde quieres ir. En pareja, sigue la revisión de lo que das y lo que recibes. El martes 20 puede salir una conversación intensa sobre eso; no la esquives, pero tampoco la tengas con prisa.',
    relaciones:
      'Tu pareja, tu socio o alguien muy cercano te está pidiendo una respuesta clara, aunque no lo diga así. Esta semana es buen momento para darla, con calma y sin reproches. El viernes y el sábado son días para hablar de lo que importa de verdad; el martes 20, mejor evitar las conversaciones a la defensiva, porque la otra persona puede sentir que la estás controlando, o tú sentir eso de ella. Si no tienes pareja, alguien que conociste hace tiempo puede reaparecer. Antes de ilusionarte, mira si lo que te atrae es la persona o el recuerdo.',
    trabajo:
      'Es una semana para que tu trabajo se vea. Si tienes una reunión importante, una evaluación o una entrevista, el viernes 16 y el lunes 19 son buenos días. Un asunto que dependía de un jefe o de una institución, un permiso, una respuesta, un cambio de puesto, puede resolverse por fin. El domingo 18, piensa en formación: un curso corto, un libro de tu campo, un viaje de trabajo. Lo que elijas ahora te servirá en los próximos meses.',
    dinero:
      'El dinero de la pareja o del socio pide orden: quién paga qué, qué se comparte y qué no. Esta semana se puede hablar de eso con más serenidad que las anteriores, sobre todo antes del martes. Evita las compras impulsivas del martes 20 y, si tienes que negociar un sueldo o un presupuesto, hazlo el viernes o el lunes. Un reconocimiento en el trabajo puede traer dinero más adelante, no ahora; no lo gastes antes de tenerlo.',
    ritmo:
      'La rutina te sostiene, pero esta semana pide un pequeño ajuste: dormir un poco más, comer a tus horas y no llevarte el trabajo a la cama. Reserva el domingo para algo que te guste de verdad, sin agenda. Si notas tensión en el cuello o en la mandíbula, es la señal de que estás aguantando algo que deberías decir. Dilo, con suavidad, y descansarás mejor.',
    consejo: 'Deja que te vean y responde a quien te pide claridad. Ser constante también es una forma de ser valiente.',
  },
  {
    slug: 'geminis',
    hook: 'Tu rutina cambia, y una idea te pide un viaje o un curso.',
    titulo: 'Semana de rutinas nuevas e ideas grandes',
    general:
      'Esta semana se nota un cambio en tu día a día: un horario, una tarea, una forma de trabajar que ya no te servía y que ahora puedes ajustar sin drama. Desde el viernes 16, una idea grande, un viaje, un curso, un proyecto que te saca de lo conocido, vuelve a coger fuerza. El domingo 18 es buen día para hablar de dinero compartido o de un acuerdo que lleváis tiempo sin revisar. Y el martes 20 cuida la salud y el ánimo: no es día para forzar.',
    relaciones:
      'En pareja, el tema de la semana es el día a día: cómo os repartís las tareas, los horarios, el cansancio. Puede parecer poco romántico, pero es donde se juega la convivencia. Hablad de eso el viernes o el sábado, cuando los dos estéis con energía. El martes 20 es fácil que una queja sobre algo pequeño esconda otra más grande; si notas que pasa, nómbrala. Si estás soltero o soltera, puedes conectar con alguien a través de un curso, un viaje o un grupo nuevo. Deja que la conversación fluya sin planear el final.',
    trabajo:
      'Tu rutina laboral está cambiando, y esta semana puedes darle forma: un nuevo horario, una herramienta que te ahorra tiempo, una tarea que delegas. El viernes 16 tienes claridad para proponerlo. Si llevas tiempo pensando en estudiar algo o en un trabajo que te obligue a viajar, el fin de semana es bueno para informarte y comparar. Un compañero o un hermano puede darte una pista útil. El martes, revisa dos veces lo que envíes.',
    dinero:
      'El dinero compartido, con tu pareja, con un socio o con la familia, pide una conversación clara, y el domingo 18 es un buen día para tenerla. Si hay una deuda, una fianza o un gasto que llevas tiempo adelantando por otra persona, pon una fecha para resolverlo. El martes 20 evita decisiones de dinero tomadas con el ánimo alterado. Un gasto en formación o en un viaje puede merecer la pena, si lo vas a aprovechar.',
    ritmo:
      'El cuerpo te pide orden: horarios de comida, sueño, movimiento. Esta semana puedes empezar un hábito pequeño que se mantenga, mejor uno que tres. El viernes y el sábado tendrás energía para moverte; el martes 20, baja el ritmo y descansa, porque es un día en el que el cansancio se nota más. Si algo te preocupa de tu salud, pide cita y deja de buscar en internet.',
    consejo: 'Cambia tu rutina en pequeño y deja espacio a una idea grande. Lo útil y lo ilusionante pueden ir juntos.',
  },
  {
    slug: 'cancer',
    hook: 'Vuelven las ganas de disfrutar y la pareja pide un paso.',
    titulo: 'Vuelve el disfrute, y la pareja pide un paso',
    general:
      'Esta semana recuperas algo que echabas de menos: las ganas de pasarlo bien, de crear, de jugar, de estar con quien te hace reír. Desde el viernes 16 se destraba un asunto de dinero compartido o de confianza que llevaba meses incómodo. El domingo 18 la pareja, o alguien con quien tienes un acuerdo, te pide un paso claro: ni un sí a medias ni un silencio. Y el martes 20 cuida los mensajes: lo que se escribe con prisa ese día se lee peor de lo que se escribió.',
    relaciones:
      'El amor vuelve a tener sitio. Si tienes pareja, el fin de semana es bueno para hacer algo juntos que no sea resolver problemas: una cena, una escapada, un plan sin móvil. El domingo 18 puede salir una conversación sobre el futuro: compromiso, convivencia, un proyecto común. Es un buen día para hablarlo con honestidad. Si no tienes pareja, alguien te puede sorprender con un interés claro. Disfrútalo sin analizarlo demasiado pronto. El martes 20, si un mensaje te sienta mal, pregunta antes de responder.',
    trabajo:
      'Tu creatividad está más viva y en el trabajo se nota: ideas, propuestas, ganas de hacer las cosas a tu manera. El viernes 16 es buen día para enseñarlas, porque también tienes la paciencia para explicarlas bien. Un asunto en casa, una obra, una mudanza, un familiar, puede pedirte tiempo esta semana; organízalo para que no se coma tu concentración. Si trabajas con un socio, el domingo toca aclarar expectativas.',
    dinero:
      'Un dinero compartido, con la pareja, con la familia o con un banco, empieza a moverse después de meses parado: un pago que llega, un acuerdo que se cierra, una deuda que se puede renegociar. No lo celebres antes de verlo en la cuenta. El martes 20 no es día para firmar ni para prestar dinero. Un gasto en ocio o en algo que te haga ilusión está bien, si no desequilibra el mes.',
    ritmo:
      'Tu casa es tu refugio y esta semana lo necesitas: ordénala, cambia algo de sitio, cocina algo que te guste. El sábado y el domingo, dedica tiempo a lo que te divierte sin sentirte culpable. El martes 20, si notas que el ánimo baja o que te sientes más sensible, no lo tapes con pantalla: llama a alguien de confianza o sal a andar. Dormir bien esta semana vale más que cualquier plan.',
    consejo: 'Date permiso para disfrutar y responde con claridad a quien te pide un paso. Las dos cosas caben en la misma semana.',
  },
  {
    slug: 'leo',
    hook: 'Energía con cabeza: una decisión en pareja y otra en casa.',
    titulo: 'Fuerza con cabeza',
    general:
      'Esta semana tienes energía de sobra y, lo que es más raro en ti, paciencia para usarla bien. El viernes 16 es uno de esos días en que puedes arrancar algo que llevaba tiempo esperando: un proyecto, un entrenamiento, una decisión. En casa, un asunto que estaba atascado, una obra, una convivencia, un papel, empieza a resolverse. El domingo 18 toca ordenar la rutina y el cuidado de tu día a día. Y el martes 20, una conversación sobre la familia o el hogar puede ponerse intensa: escucha más de lo que hablas.',
    relaciones:
      'En pareja, tu energía puede ser contagiosa o avasalladora, según cómo la uses. Esta semana, úsala para proponer, no para imponer. Alguien con quien compartes casa o vida te pide que te comprometas con algo concreto, un horario, un plan, una responsabilidad; el fin de semana es bueno para decir que sí o que no, pero no para dejarlo en el aire. Si estás soltero o soltera, tu seguridad atrae, y mucho. Solo cuida el martes 20: ese día es fácil que una conversación sobre el pasado o la familia se tense sin que nadie lo quiera.',
    trabajo:
      'Es tu semana para dar un paso visible. El viernes 16 tienes claridad, fuerza y sentido del momento: pide esa reunión, presenta esa idea, empieza esa tarea que llevas aplazando. Lo bueno es que no es solo impulso: también tienes constancia, así que lo que empieces esta semana puede durar. El domingo 18, revisa tus rutinas de trabajo: qué te roba tiempo y qué puedes quitar. Un asunto de casa o de familia puede interrumpir, pero no descarrilar.',
    dinero:
      'Tu dinero propio pide atención esta semana: un ingreso que puede crecer, un gasto fijo que puedes recortar, una compra que llevas tiempo pensando. El viernes es buen día para hacer cuentas con la cabeza fría. En casa, un gasto compartido, una reforma, un alquiler, una factura, se puede renegociar o repartir mejor. El martes 20 no es día para discutir de dinero con la familia; aplázalo al jueves.',
    ritmo:
      'Tienes el cuerpo pidiendo movimiento: entrena, corre, baila, lo que sea, pero hazlo el viernes o el sábado, que es cuando mejor te sienta. El domingo 18 ordena tu semana: horarios de comida, sueño y descanso. Si tiendes a pasarte de vueltas, esta semana el riesgo es no parar. Reserva una tarde, la del martes mejor que ninguna, para no hacer nada y dejar que la cabeza descanse.',
    consejo: 'Tienes fuerza y, esta vez, también paciencia. Úsalas juntas: empieza algo que puedas sostener.',
  },
  {
    slug: 'virgo',
    hook: 'Dinero propio, mensajes claros y una rutina que se mueve.',
    titulo: 'Pon palabras a lo que vales',
    general:
      'Esta semana hablas de dinero, del tuyo, con más claridad de la habitual: un sueldo, un presupuesto, una tarifa, lo que te parece justo. Desde el viernes 16 se desbloquea algo en tu día a día, el trabajo, la salud, un hábito, que llevaba meses sin avanzar. El domingo 18 es un día bueno para el disfrute y la creatividad, no para la lista de tareas. Y el martes 20 cuida la forma de decir las cosas: una verdad dicha con prisa puede doler más de lo que ayuda.',
    relaciones:
      'En pareja, las conversaciones pueden ir sobre dinero y sobre lo que cada uno aporta, en euros y en tiempo. Esta semana puedes hablarlo con calma, sobre todo el viernes o el sábado. El domingo 18 deja las cuentas y haz algo juntos que os divierta. El martes 20 es un día en el que las palabras se afilan solas; si una conversación empieza a torcerse, para y retómala al día siguiente. Si no tienes pareja, alguien cercano, un vecino, un compañero, un amigo de un amigo, puede convertirse en algo más. Fíjate en cómo te habla, no solo en lo que dice.',
    trabajo:
      'Tu rutina de trabajo da un giro esta semana: un proceso que estaba parado se mueve, un compañero cambia, una herramienta nueva llega. El viernes 16 es buen día para proponer mejoras y para hablar de tu tarifa o tu sueldo con argumentos. Tienes datos y tienes paciencia, una combinación que convence. El domingo 18, deja que la creatividad entre en lo que haces: una presentación distinta, una idea para el proyecto. El martes, revisa antes de enviar.',
    dinero:
      'Es tu semana para hablar de tu dinero: lo que ganas, lo que cobras, lo que te deben. El viernes 16 y el lunes 19 son buenos días para negociar o para reclamar con educación. Revisa un gasto fijo pequeño que haces por costumbre y decide si sigue teniendo sentido. El martes 20 evita compras hechas por nervios. Si un trámite de dinero llevaba meses parado, esta semana puede moverse; llama y pregunta.',
    ritmo:
      'Tu bienestar esta semana depende de dos cosas: moverte y dormir. Nada sofisticado. El viernes 16 es un buen día para retomar una rutina de ejercicio que dejaste. El domingo 18, haz algo solo por placer: cocinar, leer, pasear sin rumbo. Y el martes 20, si notas que la cabeza no para, escribe lo que te preocupa en una hoja y ciérrala. Mañana lo miras con otros ojos.',
    consejo: 'Habla de lo que vales con datos y con calma. Y deja un día de la semana para no ser útil.',
  },
  {
    slug: 'libra',
    hook: 'Tu semana: decisiones en casa y una luz nueva en lo que te gusta.',
    titulo: 'Tu momento, con los pies en casa',
    general:
      'Sigue siendo tu temporada, y esta semana se nota: te presentas con más seguridad y los demás responden. Desde el viernes 16 vuelve a moverse algo que te ilusiona, un proyecto creativo, un romance, un plan con hijos, después de meses de incertidumbre. El domingo 18 la casa y la familia piden una decisión práctica: un gasto, una mudanza, un reparto de tareas. Y el martes 20, cuidado con el dinero propio: no es día para gastar por impulso ni para prestar.',
    relaciones:
      'En pareja, el viernes y el sábado son días para hablar de proyectos comunes con ilusión real, sin cálculo. El domingo 18 puede salir un tema de casa o de familia que requiere ponerse de acuerdo: habladlo sin que se convierta en un pulso. Si estás soltero o soltera, esta semana hay chispa: alguien se fija en ti y tú lo notas. Disfrútalo sin prisa por definirlo. El martes 20, si una conversación con tu pareja o con alguien cercano empieza a ir de "lo que me debes" o "lo que te di", frena: ese día todo suena más grave de lo que es.',
    trabajo:
      'Tienes buena presencia esta semana y los demás te escuchan: aprovéchala para una reunión, una negociación o una presentación, mejor el viernes 16 o el lunes 19. Un grupo, un equipo o una asociación en la que participas vuelve a tener energía. Un proyecto creativo que estaba parado recibe luz verde o una señal de que puede arrancar. El domingo 18, organiza tu espacio de trabajo en casa; lo que ordenes ahí se nota en tu cabeza.',
    dinero:
      'Tu dinero propio es el punto delicado de la semana. Está bien darte un capricho, pero el martes 20 es un día para no tocar la tarjeta: lo que se compra ese día se mira después con otros ojos. Un gasto de casa, una reparación, un mueble, una factura, pide decisión el domingo 18; compara y decide, pero no lo dejes en el aire. Si alguien te debe dinero, pídelo el viernes con calma y por escrito.',
    ritmo:
      'Tu cuerpo responde bien esta semana: aprovecha el viernes y el sábado para moverte, salir y hacer algo que te guste. El domingo 18, dedica unas horas a tu casa: luz, orden, algo verde, una ventana abierta. Es tu forma de cuidarte. El martes 20, si notas que la cabeza da vueltas al dinero o a una relación, cambia de escenario: un paseo, una ducha larga, una llamada a alguien que te haga reír.',
    consejo: 'Disfruta de que es tu momento y decide lo práctico en casa sin dramatizar. El martes, cierra la cartera.',
  },
  {
    slug: 'escorpio',
    hook: 'Revisas lo que quieres y cómo te presentas. Despacio, y bien.',
    titulo: 'Te estás revisando, y eso es bueno',
    general:
      'Esta semana sigues en una revisión profunda de lo que quieres, en el amor, en el dinero y en la forma de presentarte al mundo. No es fácil, pero es útil. Desde el viernes 16 se desbloquea un asunto en casa o en la familia que llevaba meses atascado. El domingo 18 toca hablar claro con la gente cercana: un hermano, un vecino, un amigo. Y el martes 20 es el día más intenso para ti: una conversación sobre una relación o sobre tu casa puede ir muy al fondo. No la evites, pero elige bien el momento y las palabras.',
    relaciones:
      'Estás repasando relaciones, las de ahora y las de antes. Alguien del pasado puede reaparecer o un tema antiguo con tu pareja puede volver a la mesa. Esta semana puedes hablarlo con más honestidad que nunca, sobre todo el viernes y el sábado. El martes 20 es un día de mucha intensidad: puedes sentir celos, control o la necesidad de saberlo todo. Reconócelo, pero no actúes desde ahí. Si estás soltero o soltera, lo que quieres de una relación está cambiando. No te comprometas con nadie esta semana por no estar solo: espera a saber qué quieres tú.',
    trabajo:
      'En el trabajo, tu reputación crece y alguien con peso se fija en ti, pero esta semana también puede haber una conversación de poder: con un jefe, un socio o alguien que quiere llevar las riendas. El viernes 16 es buen día para marcar tu posición con calma y sin amenazas. El domingo 18, cuida la comunicación con compañeros y aclara un malentendido antes de que crezca. Un asunto de casa que te distraía empieza a resolverse y te deja más espacio para lo profesional.',
    dinero:
      'El dinero está muy ligado esta semana a lo que vales y a lo que te atreves a pedir. Si llevas tiempo cobrando menos de lo que crees justo, el viernes 16 es un buen día para prepararlo con cifras, no para exigirlo. El martes 20 evita por completo decisiones de dinero con otra persona: préstamos, avales, compras conjuntas. Un gasto de casa o de familia puede cerrarse por fin con un acuerdo claro.',
    ritmo:
      'Esta semana la intensidad se nota en el cuerpo: tensión, sueño irregular, ganas de aislarte. No está mal buscar tiempo a solas, pero no te encierres. El viernes y el sábado, muévete: una caminata larga, nadar, algo que te canse físicamente. El domingo 18, descansa de verdad. Y el martes 20, si la emoción es muy fuerte, escríbela antes de decirla. Si llevas semanas con el ánimo muy bajo, habla con un profesional.',
    consejo: 'Revisarse no es castigarse. Mira lo que quieres con honestidad y, el martes, respira antes de hablar.',
  },
  {
    slug: 'sagitario',
    hook: 'Cierras un ciclo en silencio y los amigos vuelven a contar.',
    titulo: 'Cierras algo en silencio, y vuelves a tus amigos',
    general:
      'Esta semana tiene dos capas. Por fuera, los amigos, los grupos y los planes colectivos vuelven a tener fuerza: alguien te llama, un plan se concreta, una comunidad en la que participas te pide algo. Por dentro, estás cerrando un ciclo que casi nadie ve: un cansancio, un duelo pequeño, una forma de querer que ya no te sirve. Desde el viernes 16 se desbloquea un mensaje o un trámite que llevaba meses en el aire. El domingo 18 toca mirar tu dinero con realismo. Y el martes 20 cuida lo que no dices: lo que callas ese día pesa.',
    relaciones:
      'En pareja, esta semana estás más callado o callada de lo habitual, y la otra persona puede notarlo y preguntarse qué pasa. No tienes que explicarlo todo, pero sí decir que estás en un momento de revisión y que no es por ella. El viernes y el sábado, un plan con amigos en común os sienta bien. El martes 20 es un día en el que las emociones no dichas pueden salir de golpe; mejor que salgan en una conversación tranquila que en una discusión. Si estás soltero o soltera, los amigos de tus amigos son la mejor puerta esta semana.',
    trabajo:
      'Tu lado más aventurero quiere ideas grandes, viajes, formación, proyectos lejanos, y esta semana tiene además la paciencia para planearlos bien. El viernes 16 es buen día para proponer algo en equipo o para retomar una colaboración. Un papel, un correo, una respuesta que esperabas desde hace meses puede llegar por fin. El domingo 18, revisa tus números profesionales: tarifas, presupuestos, lo que cobras por lo que haces. Hay margen de mejora.',
    dinero:
      'El domingo 18 es el día para mirar el dinero propio con calma: cuánto entra, cuánto sale, qué puedes recortar sin sufrir. Hay un gasto oculto, una suscripción, una comisión, un pago automático, que se te ha ido de la cabeza; búscalo. Un amigo o un grupo puede proponerte un gasto compartido, un viaje, un regalo, una cuota; está bien si lo decides tú, no por no quedar mal. El martes 20, nada de préstamos.',
    ritmo:
      'Necesitas descanso de verdad, no solo dormir: tiempo sin ruido, sin pantalla y sin obligaciones. Reserva un hueco el sábado o el domingo para eso, aunque sea una hora. El viernes 16, muévete al aire libre. Si notas que te aíslas más de la cuenta o que el ánimo baja varios días seguidos, díselo a alguien de confianza. Esta semana cerrar un ciclo cansa, y no pasa nada por reconocerlo.',
    consejo: 'Deja que un ciclo se cierre sin hacer ruido y abre la puerta a los amigos. Lo que callas, mejor dilo despacio.',
  },
  {
    slug: 'capricornio',
    hook: 'Tu semana: una decisión personal el domingo y el trabajo que se nota.',
    titulo: 'El domingo decides tú',
    general:
      'Esta semana tiene un punto central: el domingo 18, cuando la Luna llega a tu signo y te pide una decisión sobre ti: cómo te presentas, qué empiezas, qué dejas. Desde el viernes 16 se desbloquea algo en tu dinero que llevaba meses parado: un pago, un contrato, una gestión. Tu trabajo se ve y alguien lo reconoce. Y los amigos y los grupos vuelven a pedirte tiempo. El martes 20, cuidado con las conversaciones sobre lo que compartes con otros: dinero, secretos, poder. Ese día todo pesa el doble.',
    relaciones:
      'En pareja, el domingo 18 puede traer una conversación sobre lo que necesitas tú, no sobre lo que necesita la relación. Dilo con claridad y sin culpa. El viernes y el sábado son buenos días para un plan con amigos en pareja o para conocer a gente nueva, si estás soltero o soltera. El martes 20, un tema de dinero compartido, una herencia o algo que no se ha dicho puede tensarse: escucha, no acuses y aplaza la decisión al jueves. Si alguien del pasado vuelve, pregúntate si te aporta algo hoy.',
    trabajo:
      'Tu trabajo está en un buen momento: constancia, resultados y, esta semana, reconocimiento. El viernes 16 es un día clave para cerrar un acuerdo, firmar algo que estaba parado o aclarar tus condiciones. Un grupo, un equipo o una red profesional te abre una puerta a partir del fin de semana. El domingo 18 decide qué quieres hacer tú con todo esto: aceptar más responsabilidad, cambiar de rumbo o consolidar lo que tienes. Las tres opciones son válidas; lo que no vale es no decidir.',
    dinero:
      'Un asunto de dinero que llevaba meses bloqueado, un cobro, una devolución, un contrato, se mueve desde el viernes 16. Confírmalo por escrito antes de celebrarlo. El martes 20 es un día peligroso para el dinero compartido: nada de avales, préstamos ni compras conjuntas. Si un amigo o un grupo te propone un gasto, un viaje, una cuota, una inversión en común, pide los detalles y decide con calma, no en la misma conversación.',
    ritmo:
      'Esta semana la tensión se te puede ir a la espalda y a las rodillas: estira, camina, no te quedes horas en la misma postura. El domingo 18 dedícate tiempo a ti: una comida tranquila, un paseo, algo que te recuerde quién eres fuera del trabajo. El martes 20, si una conversación te deja removido, no la rumies por la noche: escribe tres líneas y duerme. Mañana se ve distinto.',
    consejo: 'El domingo decide sobre ti, no sobre los demás. Y el martes, aleja el dinero compartido de las conversaciones difíciles.',
  },
  {
    slug: 'acuario',
    hook: 'Algo tuyo que estaba atascado desde mayo vuelve a moverse.',
    titulo: 'Vuelves a moverte, y se nota',
    general:
      'Esta es tu semana en un sentido muy concreto: desde la madrugada del viernes 16, algo de ti que llevaba parado desde mayo, un cambio personal, una decisión de identidad, una forma de presentarte, se pone otra vez en marcha. Lo vas a notar como un alivio. El trabajo pide visibilidad y la pareja pide energía. El domingo 18 toca descansar y dejar que las cosas reposen: no es día para forzar nada. Y el martes 20 cuida una conversación de trabajo con alguien con poder: puede ponerse tensa.',
    relaciones:
      'Tu pareja o alguien que te importa tiene mucha energía esta semana y quiere que estés presente: planes, salidas, decisiones. El viernes y el sábado son buenos días para eso y para una conversación franca sobre hacia dónde vais. Si estás soltero o soltera, el cambio que estás viviendo se nota y atrae a gente nueva: deja que te conozcan sin esconder lo que has cambiado. El martes 20, si una persona de tu trabajo o de tu entorno intenta presionarte, no respondas en caliente. Ese día conviene no mezclar lo profesional con lo personal.',
    trabajo:
      'Tu trabajo pide verte, y esta semana tienes la claridad para decidir cómo quieres que te vean. El viernes 16 es un buen día para una reunión importante, un cambio de rol o una conversación con un jefe. Lo que llevabas meses pensando sobre tu rumbo profesional se aclara. El martes 20, sin embargo, una conversación sobre poder, control o jerarquía puede tensarse; si puedes elegir el día, elige otro. El domingo 18, descansa y no abras el correo.',
    dinero:
      'Un ingreso ligado al trabajo, un ascenso, un cliente, un reconocimiento, puede estar más cerca de lo que crees, pero no antes de unas semanas. Esta semana ordena tus cuentas y define cuánto necesitas, no cuánto quieres. El martes 20 evita negociar dinero con un superior o con una institución: espera al jueves. Un gasto en algo que marque tu cambio personal, ropa, formación, un espacio propio, tiene sentido si es medido.',
    ritmo:
      'Después de meses de sentirte frenado, ahora tienes ganas de todo. Está bien, pero dosifica: el viernes y el sábado para moverte y hacer planes, el domingo 18 para descansar sin culpa. Tu cuerpo necesita recuperar: duerme, hidrátate, deja el móvil fuera del dormitorio. El martes 20, si el trabajo te tensa, sal a andar quince minutos antes de contestar nada.',
    consejo: 'Lo que estaba parado en ti vuelve a andar. Deja que se note, descansa el domingo y no te enredes el martes.',
  },
  {
    slug: 'piscis',
    hook: 'Una idea lejana se concreta y los amigos te sostienen.',
    titulo: 'Una idea lejana se vuelve concreta',
    general:
      'Esta semana algo que parecía lejano, un viaje, un curso, un cambio de ciudad, una creencia nueva, empieza a tener fecha y forma. Desde el viernes 16 se desbloquea algo íntimo que llevaba meses en la sombra: un miedo, una culpa, un asunto que no te atrevías a mirar. Lo vas a ver con más calma. El domingo 18 los amigos y los grupos te sostienen: déjate. Y el martes 20 cuida las conversaciones sobre lo que compartes con otros, dinero, intimidad, confianza, porque ese día tienden a ir muy al fondo.',
    relaciones:
      'En pareja, sigue la revisión de la confianza y de lo que compartís, y esta semana llega a un punto delicado el martes 20. Si hay algo que no os habéis dicho, es mejor que salga en una conversación elegida que en una discusión. El viernes y el sábado, en cambio, son días luminosos para los dos: haced un plan que os saque de la rutina. Si estás soltero o soltera, alguien de otro lugar, otra cultura u otro ambiente puede interesarte; es una buena semana para dejarte sorprender, sin prometer nada todavía.',
    trabajo:
      'Tu rutina de trabajo gana fuerza y constancia desde el viernes 16: es buen momento para fijar horarios, cerrar un proceso o pedir ayuda con una tarea que llevas arrastrando. Si tienes un proyecto que implica estudiar, viajar o trabajar con gente de fuera, esta semana se concreta. El domingo 18, un grupo o una red profesional te da una pista o un contacto útil. El martes 20, cuidado con firmar o comprometer dinero con un socio.',
    dinero:
      'El dinero propio pide orden y poco más: una revisión de gastos fijos y una decisión sobre algo que llevas tiempo aplazando. El martes 20 es el día a evitar para cualquier asunto de dinero compartido, con tu pareja, con un socio, con la familia. Un gasto en formación o en un viaje puede tener sentido, si ya tienes claro para qué. Y si un amigo te pide dinero, piensa si puedes darlo sin esperar que vuelva.',
    ritmo:
      'Absorbes lo que hay alrededor, y esta semana hay intensidad. Protégete con rutinas sencillas: dormir a tu hora, comer de verdad, moverte cada día aunque sea poco. El viernes y el sábado te sentará bien estar al aire libre o cerca del agua. El domingo 18, quedar con amigos te recarga más que quedarte solo. El martes 20, si una emoción vieja aparece, no la ahogues: escríbela o cuéntala a alguien de confianza.',
    consejo: 'Dale fecha a esa idea lejana y déjate sostener por los tuyos. El martes, lo íntimo se habla despacio.',
  },
]

export const SEMANA_2026_10_15: HoroscopeWeek = {
  id: '2026-10-15',
  slug: 'semana-15-21-octubre-2026',
  start: '2026-10-15',
  end: '2026-10-21',
  label: '15 al 21 de octubre de 2026',
  shortLabel: '15 al 21 de octubre',
  days: 'jueves 15, viernes 16, sábado 17, domingo 18, lunes 19, martes 20 y miércoles 21 de octubre de 2026',
  sky: {
    items: [
      'Plutón retoma el movimiento directo en Acuario el viernes 16 de octubre de 2026, sobre las 02:40 UTC (04:40 en la Península y Baleares, 03:40 en Canarias), después de cinco meses retrógrado desde el 6 de mayo. Cafe Astrology y Astro-Seek coinciden en el día y el signo; el minuto cambia según el cálculo.',
      'Ese mismo viernes 16, Marte en Leo forma un trígono con Saturno en Aries: energía con disciplina. El Sol en Libra sigue en sextil con Júpiter en Leo hasta el miércoles 21.',
      'La Luna llega al cuarto creciente el domingo 18 de octubre de 2026 a las 16:12 UTC (18:12 en la Península y Baleares, 17:12 en Canarias), en Capricornio. Time and Date la sitúa a las 16:12 UTC; otras efemérides, un minuto después. Durante la semana la Luna pasa por Sagitario, Capricornio, Acuario y, desde el miércoles 21, Piscis.',
      'Venus sigue retrógrada en Escorpio toda la semana y el martes 20 forma una cuadratura con Plutón. Mercurio sigue directo en Escorpio, aunque ya en la zona previa a su retroceso, que empieza el sábado 24 de octubre, fuera de esta semana. Saturno y Neptuno siguen retrógrados en Aries, y Urano en Géminis. Cuando las fuentes no coinciden en el grado, no lo inventamos.',
    ],
    sourceName: 'Fases de la Luna en octubre de 2026, Time and Date',
    sourceUrl: 'https://www.timeanddate.com/news/astronomy/moon-october-2026',
  },
  transits: [
    { label: 'El Sol está en Libra', sign: 'libra' },
    { label: 'Venus retrógrada y Mercurio están en Escorpio', sign: 'escorpio' },
    { label: 'Plutón vuelve al movimiento directo en Acuario el viernes', sign: 'acuario' },
    { label: 'Marte y Júpiter están en Leo', sign: 'leo' },
    { label: 'Saturno retrógrado está en Aries', sign: 'aries' },
    { label: 'La Luna en cuarto creciente del domingo cae en Capricornio', sign: 'capricornio' },
  ],
  signs: readings.map(withSignInfo),
}
