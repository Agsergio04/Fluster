import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useTema from '../../hooks/useTema'
import { getUsuario } from '../../services/session'
import Header from '../../components/organismos/Header'

function Contacto() {
  const navigate = useNavigate()
  const [tema, toggleTema] = useTema()
  const usuario = getUsuario()

  const [form, setForm] = useState({ nombre: '', email: '', asunto: '', mensaje: '' })
  const [enviado, setEnviado] = useState(false)

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setEnviado(true)
  }

  return (
    <>
      <Header
        rol={usuario?.rol ?? null}
        tema={tema}
        onToggleTema={toggleTema}
        onNavegar={ruta => navigate(ruta)}
      />

      <main className="pagina-estatica">
        <section className="pagina-estatica__intro">
          <h1 className="pagina-estatica__titulo">Contacto</h1>
          <p className="pagina-estatica__subtitulo">
            ¿Tienes preguntas? Nos encantaría escucharte. Envíanos un mensaje
            y te responderemos lo antes posible.
          </p>
        </section>

        <section className="pagina-estatica__seccion pagina-estatica__seccion--contacto">
          <div className="contacto-layout">

            <div className="contacto-layout__info">
              <h2 className="pagina-estatica__seccion-titulo">Información de contacto</h2>
              <div className="pagina-estatica__contacto-card">
                <span className="pagina-estatica__contacto-tipo">Correo electrónico</span>
                <a href="mailto:agsergio@iesrafaelalberti.es" className="pagina-estatica__contacto-valor">
                  agsergio@iesrafaelalberti.es
                </a>
                <p className="pagina-estatica__seccion-texto">
                  Respuesta en 24–48 horas.
                </p>
              </div>
            </div>

            <div className="contacto-layout__formulario">
              <h2 className="pagina-estatica__seccion-titulo">Envíanos un mensaje</h2>

              {enviado ? (
                <div className="contacto-exito" role="alert">
                  Mensaje enviado correctamente. Te responderemos pronto.
                </div>
              ) : (
                <form className="contacto-form" onSubmit={handleSubmit} noValidate>
                  <div className="contacto-form__grupo">
                    <label className="contacto-form__label" htmlFor="nombre">Nombre</label>
                    <input
                      className="contacto-form__input"
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={form.nombre}
                      onChange={handleChange}
                      placeholder="Tu nombre"
                      required
                    />
                  </div>

                  <div className="contacto-form__grupo">
                    <label className="contacto-form__label" htmlFor="email">Correo electrónico</label>
                    <input
                      className="contacto-form__input"
                      type="email"
                      id="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="tu@email.com"
                      required
                    />
                  </div>

                  <div className="contacto-form__grupo">
                    <label className="contacto-form__label" htmlFor="asunto">Asunto</label>
                    <input
                      className="contacto-form__input"
                      type="text"
                      id="asunto"
                      name="asunto"
                      value={form.asunto}
                      onChange={handleChange}
                      placeholder="¿Cuál es tu consulta?"
                      required
                    />
                  </div>

                  <div className="contacto-form__grupo">
                    <label className="contacto-form__label" htmlFor="mensaje">Mensaje</label>
                    <textarea
                      className="contacto-form__textarea"
                      id="mensaje"
                      name="mensaje"
                      value={form.mensaje}
                      onChange={handleChange}
                      placeholder="Cuéntanos más detalles..."
                      rows={5}
                      required
                    />
                  </div>

                  <button className="contacto-form__boton" type="submit">
                    Enviar mensaje
                  </button>
                </form>
              )}
            </div>

          </div>
        </section>
      </main>
    </>
  )
}

export default Contacto
