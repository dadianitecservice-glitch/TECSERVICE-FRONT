export function AboutSection() {
  return (
    <section className="about-section" id="about" aria-labelledby="about-heading">
      <div className="about-copy">
        <div className="about-intro">
          <div>
            <p className="about-eyebrow">TECSERVICE · 2002 წლიდან</p>
            <h2 className="display-title" id="about-heading">ჩვენს შესახებ</h2>
          </div>
          <p>
            ტექსერვისი მომხმარებლებს ემსახურება ელექტრონული ტექნიკის დიაგნოსტიკისა და შეკეთების მიმართულებით.
            ვმუშაობთ როგორც ყოველდღიურ, ისე რთულ კომპონენტურ და ლაბორატორიულ შემთხვევებზე — კომპიუტერებიდან და
            კონსოლებიდან ინფორმაციის აღდგენამდე და სპეციალიზებულ ელექტრონიკამდე.
          </p>
        </div>
        <strong className="about-statement">ტექსერვისი — თქვენი ტექნიკის საიმედო სერვისი</strong>
        <div className="about-facts">
          <span><img src="/assets/icons/about-calendar.svg" alt="" />2002 წლიდან</span>
          <i />
          <span><img src="/assets/icons/about-wrench.svg" alt="" />კომპონენტური შეკეთება</span>
          <i />
          <span><img src="/assets/icons/about-drive.svg" alt="" />პროფესიონალური მონაცემთა აღდგენა</span>
        </div>
        <a className="about-link" href="/about">ჩვენს შესახებ დეტალურად →</a>
      </div>
      <figure
        className="about-workspace-visual"
        id="contact"
        data-asset-label="TECSERVICE Repair Workspace Photo — Replace Later"
      >
        <img
          src="/assets/blog/drone-repair.jpg"
          alt="ელექტრონიკის პროფესიონალური შეკეთების სამუშაო სივრცე"
          loading="lazy"
        />
      </figure>
    </section>
  )
}
