import React from "react"
import styles from "./EmbedCodesandbox.module.css"

export default function EmbedCodesandbox({
  src,
  title,
  width = "100%",
  height = "500px",
}) {
  return (
    <section className={styles.codesandbox}>
      {title && <h3 className={styles.title}>{title}</h3>}
      <div className="container">
        <iframe
          src={src}
          style={{
            width,
            height,
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
