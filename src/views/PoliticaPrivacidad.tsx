import React from 'react';
import { Shield } from 'lucide-react';

export const PoliticaPrivacidad = () => {
  return (
    <div className="p-6 max-w-2xl mx-auto w-full pb-12">
      <div className="flex items-center gap-3 mb-8 mt-4">
        <Shield className="w-8 h-8 text-[#D4AF37]" />
        <h1 className="text-2xl font-serif text-white">Política de Privacidad</h1>
      </div>
      
      <div className="space-y-8 text-zinc-300 text-sm leading-relaxed">
        <div>
          <p className="text-zinc-500 mb-6 uppercase tracking-wider text-xs font-bold">Última actualización: 24 de junio de 2026</p>
          <p>En <strong className="text-white">La Llave del Éxito</strong> ("la Plataforma", "nosotros") recolectamos los siguientes datos cuando usted utiliza nuestros servicios:</p>
        </div>

        <section>
          <h2 className="text-lg font-bold text-[#D4AF37] mb-3 border-b border-zinc-800 pb-2">1. Información que recolectamos</h2>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong className="text-white">Datos de registro:</strong> nombre completo, correo electrónico, número de teléfono/WhatsApp, ciudad de residencia.</li>
            <li><strong className="text-white">Datos de pago:</strong> información necesaria para procesar transacciones de suscripción (planes semanal, quincenal, mensual) y compra del ebook, gestionados a través de pasarelas de pago de terceros (Hotmart y/o procesadores de pago integrados). No almacenamos directamente números de tarjetas de crédito/débito.</li>
            <li><strong className="text-white">Datos de uso:</strong> páginas visitadas, módulos del curso completados, interacciones con la app, dirección IP y tipo de dispositivo, con fines estadísticos y de mejora del servicio.</li>
            <li><strong className="text-white">Cookies y tecnologías similares:</strong> utilizadas para mantener su sesión activa y, en el futuro, para mostrar publicidad personalizada a través de Google AdSense.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#D4AF37] mb-3 border-b border-zinc-800 pb-2">2. Cómo usamos su información</h2>
          <p className="mb-2">Utilizamos sus datos para:</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>Crear y administrar su cuenta de usuario o cerrajero suscriptor.</li>
            <li>Procesar pagos y gestionar su acceso a contenido del curso/academia.</li>
            <li>Enviar comunicaciones relacionadas con su cuenta, soporte o novedades de la Plataforma.</li>
            <li>Mejorar la experiencia de usuario y el contenido ofrecido.</li>
            <li>Mostrar publicidad relevante a través de servicios de terceros como Google AdSense (cuando esté activo).</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#D4AF37] mb-3 border-b border-zinc-800 pb-2">3. Compartir información con terceros</h2>
          <p className="mb-2">No vendemos su información personal. Podemos compartir datos limitados con:</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li><strong className="text-white">Procesadores de pago</strong> (Hotmart u otros) para completar transacciones.</li>
            <li><strong className="text-white">Google AdSense / Google Ads</strong>, que puede usar cookies para mostrar anuncios basados en sus intereses. Puede gestionar sus preferencias de anuncios en Configuración de anuncios de Google.</li>
            <li><strong className="text-white">Autoridades legales</strong>, únicamente cuando sea requerido por ley.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#D4AF37] mb-3 border-b border-zinc-800 pb-2">4. Almacenamiento y seguridad</h2>
          <p>Sus datos se almacenan utilizando medidas de seguridad razonables para prevenir accesos no autorizados, pérdida o alteración de la información. Sin embargo, ningún sistema es 100% infalible, y no podemos garantizar seguridad absoluta.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#D4AF37] mb-3 border-b border-zinc-800 pb-2">5. Sus derechos</h2>
          <p className="mb-2">Usted tiene derecho a:</p>
          <ul className="list-disc list-inside space-y-2 ml-2 mb-4">
            <li>Solicitar acceso a los datos personales que tenemos sobre usted.</li>
            <li>Solicitar la corrección o actualización de sus datos.</li>
            <li>Solicitar la eliminación de su cuenta y datos asociados.</li>
            <li>Retirar su consentimiento para el uso de sus datos en cualquier momento.</li>
          </ul>
          <p>Para ejercer estos derechos, contáctenos a través de los canales indicados en la sección "Contacto" de esta política.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#D4AF37] mb-3 border-b border-zinc-800 pb-2">6. Cookies</h2>
          <p>Usamos cookies para mantener su sesión iniciada y, en el futuro, para fines publicitarios a través de Google AdSense. Puede deshabilitar las cookies desde la configuración de su navegador, aunque esto podría afectar la funcionalidad de la Plataforma.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#D4AF37] mb-3 border-b border-zinc-800 pb-2">7. Menores de edad</h2>
          <p>Nuestros servicios están dirigidos a personas mayores de 18 años. No recolectamos intencionalmente información de menores de edad.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#D4AF37] mb-3 border-b border-zinc-800 pb-2">8. Cambios a esta política</h2>
          <p>Esta Política de Privacidad puede actualizarse periódicamente. Notificaremos cambios significativos publicando la nueva versión en esta misma página, con la fecha de actualización correspondiente.</p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-[#D4AF37] mb-3 border-b border-zinc-800 pb-2">9. Contacto</h2>
          <p className="mb-2">Si tiene preguntas sobre esta Política de Privacidad, puede contactarnos a través de:</p>
          <ul className="list-none space-y-2 ml-2 mb-6">
            <li><strong className="text-white">WhatsApp:</strong> [agregar número]</li>
            <li><strong className="text-white">Correo electrónico:</strong> [agregar correo]</li>
            <li><strong className="text-white">Instagram/Facebook:</strong> La Llave del Éxito</li>
          </ul>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mt-8 text-center text-xs text-zinc-500">
            <p>Esta Política de Privacidad fue elaborada para cumplir con los requisitos de transparencia exigidos por Google AdSense y buenas prácticas de protección de datos.</p>
          </div>
        </section>
      </div>
    </div>
  );
};
