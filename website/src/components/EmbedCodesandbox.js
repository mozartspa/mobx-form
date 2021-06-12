import React from "react"

export default function EmbedCodesandbox({ src }) {
  return (
    <section className="margin-bottom">
      <div className="container">
        <iframe
          src={src}
          style={{
            width: "100%",
            height: "500px",
            border: "0",
            borderRadius: "4px",
            overflow: "hidden",
          }}
          title="Framer Motion: Side menu (forked)"
          allow="accelerometer; ambient-light-sensor; camera; encrypted-media; geolocation; gyroscope; hid; microphone; midi; payment; usb; vr; xr-spatial-tracking"
          sandbox="allow-forms allow-modals allow-popups allow-presentation allow-same-origin allow-scripts"
        />
      </div>
    </section>
  )
}
