import clsx from "clsx"
import React from "react"
import styles from "./HomepageFeatures.module.css"

const FeatureList = [
  {
    title: "Hook based",
    Svg: require("../../static/img/undraw_react.svg").default,
    description: (
      <>
        No need to pollute your app with fancy components, only simple and{" "}
        <i>easy to use</i> hooks. But sure, we have those too.
      </>
    ),
  },
  {
    title: "High performance",
    Svg: require("../../static/img/undraw_fast_loading.svg").default,
    description: (
      <>
        Faster than light speed is not possible, but we come very close. Give it
        a try and let us know.
      </>
    ),
  },
  {
    title: "Powered by MobX",
    Svg: require("../../static/img/undraw_design_components.svg").default,
    description: (
      <>
        Standing on the shoulders of giants, we use MobX to re-render only what
        it really needs to re-render.
      </>
    ),
  },
]

function Feature({ Svg, title, description }) {
  return (
    <div className={clsx("col col--4")}>
      <div className="text--center">
        {Svg && <Svg className={styles.featureSvg} alt={title} />}
      </div>
      <div className="text--center padding-horiz--md">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  )
}
