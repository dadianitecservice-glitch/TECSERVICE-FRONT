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
            ტექსერვისი 2002 წლიდან ემსახურება მომხმარებლებს ელექტრონული ტექნიკის დიაგნოსტიკისა და შეკეთების მიმართულებით.
            ვმუშაობთ როგორც ყოველდღიურ, ისე რთულ კომპონენტურ და ლაბორატორიულ შემთხვევებზე — კომპიუტერებიდან და
            კონსოლებიდან ინფორმაციის აღდგენამდე და სპეციალიზებულ ელექტრონიკამდე.
          </p>
        </div>
        <strong className="about-statement">ტექსერვისი — თქვენი ტექნიკის სერვისი 2002 წლიდან</strong>
        <div className="about-facts">
          <span><img src="/assets/icons/about-calendar.svg" alt="" />2002 წლიდან</span>
          <i />
          <span><img src="/assets/icons/about-wrench.svg" alt="" />კომპონენტური შეკეთება</span>
          <i />
          <span><img src="/assets/icons/about-drive.svg" alt="" />პროფესიონალური მონაცემთა აღდგენა</span>
        </div>
        <a className="about-link" href="/about">ჩვენს შესახებ დეტალურად →</a>
      </div>
      <div className="about-map" id="contact">
        <iframe
          title="TECSERVICE-ის მდებარეობა Google Maps-ზე"
          src="https://www.google.com/maps?q=TecService%20-%20%E1%83%A2%E1%83%94%E1%83%A5%E1%83%A1%E1%83%94%E1%83%A0%E1%83%95%E1%83%98%E1%83%A1%E1%83%98&ll=41.7188516%2C44.8036156&z=17&output=embed"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <img className="about-map__fallback" src="/assets/map/tecservice-map.jpg" alt="TECSERVICE-ის მდებარეობა რუკაზე" />
        <a href="https://maps.app.goo.gl/6hAmMDGmQBPR8gLQ7" target="_blank" rel="noreferrer">Google Maps-ზე გახსნა ↗</a>
      </div>
    </section>
  )
}
