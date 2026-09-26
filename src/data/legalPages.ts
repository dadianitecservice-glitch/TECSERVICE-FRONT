// Keep these documents out of search until the business details and policies
// in docs/legal-content-review.md have been confirmed by the site owner.
export const legalDocumentsApproved = false
export type LegalPageKind = 'terms' | 'privacy'

type LegalDocument = {
  title: string
  description: string
  intro: string
  sections: { id: string; title: string; paragraphs: string[] }[]
}

export const legalDocuments: Record<'ka' | 'en', Record<LegalPageKind, LegalDocument>> = {
  ka: {
    terms: {
      title: 'მომსახურების პირობები',
      description: 'TECSERVICE-ის მომსახურების პირობები: დიაგნოსტიკა, ფასები, მოწყობილობის ჩაბარება, პირადი კაბინეტი და საჯარო კომენტარები.',
      intro: 'მნიშვნელოვანი ინფორმაცია მომსახურების შეთანხმების, პირადი კაბინეტისა და საიტის ფუნქციების გამოყენების შესახებ.',
      sections: [
        { id: 'scope', title: 'საიტი და მომსახურება', paragraphs: [
          'TECSERVICE-ის მომსახურების მიმწოდებელია შპს „სქაინეთ დისტრიბიუშენი“, საიდენტიფიკაციო კოდი: 427740000. საიტზე წარმოდგენილია სერვისები, საორიენტაციო ფასები და საკონტაქტო ინფორმაცია. კონკრეტული მოწყობილობის მიღება და სამუშაოს პირობები სერვის ცენტრთან ინდივიდუალურად თანხმდება.',
          'ონლაინ აღწერა ან AI ასისტენტის პასუხი არ ცვლის მოწყობილობის შემოწმებას და არ წარმოადგენს საბოლოო დიაგნოზს ან შეკეთების გარანტიას.',
        ] },
        { id: 'diagnostics', title: 'დიაგნოსტიკა და შეთანხმება', paragraphs: [
          'მოწყობილობის ჩაბარებისას მოგვაწოდეთ ზუსტი მოდელი, პრობლემის აღწერა და ინფორმაცია წინა დაზიანების ან შეკეთების შესახებ. დიაგნოსტიკის საფასური და მისი გადახდის პირობები მომხმარებელთან წინასწარ თანხმდება.',
          'თუ დაზიანების მიზეზი დადგენილია, შეკეთება შესაძლებელია და მომხმარებელი შეთავაზებული ღირებულების გამო შეკეთებაზე უარს ამბობს, დიაგნოსტიკის საფასური გადასახდელია. თუ დაზიანების მიზეზის დადგენა ვერ ხერხდება, დიაგნოსტიკა უფასოა.',
          'სხვა შემთხვევებში დიაგნოსტიკის გადახდის პირობები ინდივიდუალურად, სამუშაოს დაწყებამდე თანხმდება.',
          'სამუშაოს მოცულობა, საჭირო ნაწილები და ფასი თანხმდება შემოწმების შემდეგ. დამატებითი დაზიანების აღმოჩენისას სამუშაოს ცვლილებაც შეთანხმებას საჭიროებს.',
        ] },
        { id: 'prices', title: 'ფასები და სავარაუდო ვადები', paragraphs: [
          'საიტზე „დან“ ნიშნულით მითითებული ფასი საწყისი, საორიენტაციო ღირებულებაა. საბოლოო თანხა დამოკიდებულია მოდელზე, დაზიანებაზე, სამუშაოსა და საჭირო ნაწილებზე. გადაამოწმეთ, მოიცავს თუ არა შეთავაზება ნაწილის ღირებულებას.',
          'ვადები სავარაუდოა და დამოკიდებულია დიაგნოსტიკის შედეგზე, რიგსა და ნაწილების ხელმისაწვდომობაზე. კონკრეტული დასრულების თარიღი სერვის ცენტრთან დააზუსტეთ.',
        ] },
        { id: 'device-data', title: 'მოწყობილობა და მონაცემები', paragraphs: [
          'თუ მოწყობილობა ამის საშუალებას იძლევა, ჩაბარებამდე შექმენით მნიშვნელოვანი მონაცემების სარეზერვო ასლი. მონაცემების შენარჩუნების ან აღდგენის საჭიროება მიღებისას შეგვატყობინეთ.',
          'პაროლები, საბანკო ინფორმაცია და პირადი ფაილები საჯარო ფორმაში ან AI ასისტენტთან არ გაგზავნოთ. მოწყობილობაზე წვდომის აუცილებლობა და უსაფრთხო გადაცემის გზა სპეციალისტთან ცალკე შეათანხმეთ.',
        ] },
        { id: 'handover', title: 'შედეგი და მოწყობილობის დაბრუნება', paragraphs: [
          'დამატებითი გარანტიის არსებობა, ვადა და პირობები განისაზღვრება ინდივიდუალურად, კონკრეტული სამუშაოსა და გამოყენებული ნაწილის მიხედვით. მომხმარებელს პირობები ეცნობება შეკეთების დაწყებამდე. მოთხოვნის შემთხვევაში საგარანტიო პირობებს წერილობით ან თქვენთვის მისაღები სხვა ფორმით მიიღებთ.',
          'ჩაბარებისას გაეცანით შესრულებულ სამუშაოს და შემოწმების შედეგს. დამატებითი გარანტიის არარსებობა არ ზღუდავს მომხმარებლის კანონით გათვალისწინებულ უფლებებს.',
          'მომსახურებასთან დაკავშირებული კითხვის ან პრეტენზიის შემთხვევაში დაგვიკავშირდით ქვემოთ მითითებული გზით. საკითხის განხილვისთვის მიუთითეთ სერვისის კოდი და აღწერეთ პრობლემა; ამ მიზნით პაროლებისა და პირადი ფაილების გამოგზავნა საჭირო არ არის.',
        ] },
        { id: 'online-tools', title: 'საიტის ონლაინ ფუნქციები', paragraphs: [
          'სერვისის კოდი განკუთვნილია თქვენი მოწყობილობის მომსახურების შესახებ ინფორმაციის მისაღებად. შეინახეთ იგი უსაფრთხოდ და ნუ გაუზიარებთ სხვა პირებს. შეკვეთის მდგომარეობის ან ჩაბარების დროის დასაზუსტებლად შეგიძლიათ დაგვიკავშირდეთ.',
          'ასისტენტი ამ ეტაპზე სატესტო რეჟიმში მუშაობს: პასუხს ბრაუზერში ამზადებს სერვისების შვიდ გვერდზე მითითებული ფასებისა და ინფორმაციის მიხედვით. ეს არის საორიენტაციო დახმარება და არა მოწყობილობის დიაგნოსტიკა, საბოლოო შეთავაზება ან შეკვეთის გაფორმება. ფოტოს ატვირთვა ამ ვერსიაში ხელმისაწვდომი არ არის.',
          'მაღაზიაში შეკვეთის გაფორმებამდე გაეცანით პროდუქტის აღწერას, ფასს, გადახდისა და მიწოდების პირობებს. მაღაზიის ან სხვა გარე საიტის გამოყენებისას მოქმედებს შესაბამის გვერდზე მითითებული წესები.',
        ] },
        { id: 'customer-account', title: 'რეგისტრაცია და ანგარიშის უსაფრთხოება', paragraphs: [
          'რეგისტრაციისთვის მიუთითეთ თქვენი სახელი და გვარი, მოქმედი მობილურის ნომერი და პაროლი. მობილურის ნომერი აუცილებელია, ელფოსტა კი არასავალდებულოა. ახალი ანგარიშის გამოყენება შესაძლებელია ჩვენი გუნდის მიერ მისი შემოწმებისა და დამტკიცების შემდეგ.',
          'გამოიყენეთ მხოლოდ თქვენი მონაცემები და არ შექმნათ ანგარიში სხვა პირის სახელით. დაიცავით პაროლი, არ გაუზიაროთ სხვებს და საერთო მოწყობილობაზე მუშაობის დასრულების შემდეგ გამოდით ანგარიშიდან. წვდომის პრობლემის ან საეჭვო მოქმედების შემთხვევაში დაგვიკავშირდით.',
          'რეგისტრაციისას მითითებული მობილურის ნომერი კაბინეტიდან არ იცვლება. ნომრის შეცვლისთვის მიმართეთ ჩვენს გუნდს; ანგარიშისა და შეკვეთების დასაცავად შესაძლოა საჭირო გახდეს თქვენი ვინაობის გადამოწმება.',
        ] },
        { id: 'account-records', title: 'პირადი კაბინეტი და დოკუმენტები', paragraphs: [
          'პირად კაბინეტში შეგიძლიათ განაახლოთ პროფილის მონაცემები, სურვილის შემთხვევაში მიუთითოთ პირადი ნომერი, დაამატოთ ან წაშალოთ მისამართები და შეცვალოთ პაროლი. გარკვეული ცვლილებების დადასტურებისთვის მიმდინარე პაროლის შეყვანაა საჭირო.',
          'კაბინეტში ხელმისაწვდომია თქვენს ანგარიშთან დაკავშირებული სერვისები, შესყიდვები და გაცემული ინვოისები. დოკუმენტის გახსნა ან ჩამოტვირთვა თავისთავად გადახდას არ ნიშნავს. სტატუსის, თანხის ან ჩანაწერის შეუსაბამობის შემთხვევაში მოგვწერეთ ან დაგვირეკეთ და მიუთითეთ შესაბამისი ნომერი.',
          'გამოიყენეთ მხოლოდ თქვენი ჩანაწერები და დოკუმენტები. პირადი კაბინეტის მონაცემები და ჩამოტვირთული ინვოისები საჯაროდ არ გააზიაროთ. ბარათის დამატებისა და დამახსოვრების ნაწილი ამ ეტაპზე მხოლოდ ვიზუალურია — იგი ბარათს არ ინახავს და გადახდას არ ასრულებს.',
        ] },
        { id: 'product-comments', title: 'პროდუქტის საჯარო კომენტარები', paragraphs: [
          'დამტკიცებული ანგარიშით შეგიძლიათ პროდუქტზე საჯარო კომენტარის დაწერა. კომენტარი ჩანს პროდუქტის გვერდზე ავტორის სახელითა და თარიღით; ეს არ არის პირადი მიმოწერა ჩვენს გუნდთან. საკუთარი კომენტარის შეცვლა ან წაშლა შეგიძლიათ კაბინეტის „ჩემი კომენტარების“ განყოფილებიდან.',
          'კომენტარი უნდა ეხებოდეს პროდუქტს და ასახავდეს თქვენს გამოცდილებას ან კითხვას. არ გამოაქვეყნოთ სპამი, მუქარა, შეურაცხმყოფელი ან უკანონო შინაარსი, სხვისი პირადი ინფორმაცია, პაროლები, ტელეფონის ნომრები ან გადახდის მონაცემები.',
          'თუ კომენტარში ხედავთ თქვენს პირად მონაცემებს ან წესების შესაძლო დარღვევას, დაგვიკავშირდით და მიუთითეთ პროდუქტი და კომენტარი. საკითხის განხილვისთვის დამატებითი პირადი ინფორმაციის საჯაროდ გამოქვეყნება საჭირო არ არის.',
        ] },
      ],
    },
    privacy: {
      title: 'კონფიდენციალურობის პოლიტიკა',
      description: 'როგორ გამოიყენება TECSERVICE-ში ანგარიშის მონაცემები, მისამართები, შეკვეთები და საჯარო კომენტარები; შენახვის ვადები და სატესტო ასისტენტი.',
      intro: 'აქ აღწერილია საიტის მიმდინარე ფუნქციები და ის, რას უნდა მიაქციოთ ყურადღება ინფორმაციის გაზიარებისას.',
      sections: [
        { id: 'contact-data', title: 'როცა გვიკავშირდებით', paragraphs: [
          'ტელეფონით ან WhatsApp-ით დაკავშირებისას თქვენ მიერ გაზიარებული ნომერი, შეტყობინება და მოწყობილობის ინფორმაცია შეიძლება გამოყენებული იყოს თქვენს კითხვაზე პასუხისა და მომსახურების შეთანხმებისთვის. გამოგვიგზავნეთ მხოლოდ საკითხის გასარკვევად საჭირო ინფორმაცია.',
          'თქვენი მოთხოვნით მომსახურების შესათანხმებლად ან შეთანხმებული სამუშაოს შესასრულებლად აუცილებელი მონაცემების დამუშავების საფუძველია მომსახურების შეთანხმება ან თქვენთან დადებული გარიგების შესრულება. ამ მიზნით საჭირო საკონტაქტო ან მოწყობილობის ინფორმაციის გარეშე შესაძლოა ვერ მოვახერხოთ მომსახურების შეთანხმება ან შეკვეთის შესახებ თქვენთან დაკავშირება.',
          'საიტის ოპერატორია შპს „სქაინეთ დისტრიბიუშენი“, საიდენტიფიკაციო კოდი: 427740000. TECSERVICE-ის საკონტაქტო ნომერია +995 591 47 40 40; სერვის ცენტრი მდებარეობს თბილისში, ცოტნე დადიანის 7ბ/2-ში.',
        ] },
        { id: 'customer-account', title: 'ანგარიშის შექმნა და პროფილის მონაცემები', paragraphs: [
          'რეგისტრაციისას მუშავდება თქვენი სახელი და გვარი, აუცილებელი მობილურის ნომერი და, თუ მიუთითებთ, ელფოსტა. ეს მონაცემები გამოიყენება ანგარიშის შექმნისთვის, გუნდის მიერ მისი შემოწმებისთვის, ავტორიზაციისა და თქვენს მომსახურებასთან დაკავშირებისთვის.',
          'პაროლი სერვერზე მოწმდება ავტორიზაციისა და დაცული ცვლილებების დასადასტურებლად; ანგარიშის ჩანაწერში ინახება მისი ჰეში და არა ღია ტექსტი. პაროლი არ შეიტანოთ კომენტარში, ასისტენტთან ან მხარდაჭერისთვის გაგზავნილ შეტყობინებაში.',
          'პროფილში პირადი ნომრის დამატება არასავალდებულოა და რეგისტრაციისთვის საჭირო არ არის. თუ მიუთითებთ, იგი ინახება თქვენს პროფილთან ერთად. ნომრის საჭიროება კონკრეტული მომსახურების ან დოკუმენტისათვის წინასწარ დააზუსტეთ; სხვა პირის საიდენტიფიკაციო მონაცემები არ შეიყვანოთ.',
          'თქვენ მიერ დამატებული მისამართის დასახელება, ქალაქი და მისამართი ინახება თქვენს ანგარიშთან ერთად, რათა კაბინეტში მათი მართვა შეძლოთ. მისამართის შენახვა თავისთავად არ ნიშნავს მიწოდების შეკვეთას ან მის ავტომატურ გადაცემას კურიერისთვის.',
        ] },
        { id: 'account-records', title: 'სერვისები, შესყიდვები და ინვოისები', paragraphs: [
          'კაბინეტი აჩვენებს თქვენს ანგარიშთან დაკავშირებულ სერვისის კოდს, მოწყობილობის ან პროდუქტის მონაცემებს, სტატუსს, თარიღებს, ფასსა და ხელმისაწვდომ ინვოისებს. ეს ინფორმაცია გამოიყენება მომსახურებისა და შესყიდვების ისტორიის სანახავად და შესაბამის დოკუმენტებზე წვდომისთვის.',
          'კაბინეტისა და ინვოისების სანახავად საჭიროა ავტორიზაცია. პროფილის მონაცემები, მისამართები და პირადი დოკუმენტები პროდუქტის საჯარო კომენტართან ერთად არ ქვეყნდება. ჩამოტვირთული დოკუმენტის ასლი თქვენს მოწყობილობაზეც რჩება და მის გაზიარებას თავად აკონტროლებთ.',
          'ბარათის დამატებისა და დამახსოვრების მიმდინარე ვიზუალური ფორმა არ აგროვებს ბარათის ნომერს, მოქმედების ვადას ან CVV-ს, არ ინახავს საბანკო ბარათს და არ ასრულებს გადახდას. რეალური საბანკო ფუნქციის ჩართვამდე ინფორმაცია შესაბამის პროვაიდერსა და მონაცემთა დამუშავებაზე განახლდება.',
        ] },
        { id: 'assistant', title: 'სატესტო ასისტენტი', paragraphs: [
          'სატესტო ასისტენტი თქვენს მიერ შეყვანილ პრობლემასა და არჩეულ კატეგორიას ამუშავებს ბრაუზერში, მიმდინარე გვერდის დროებით მეხსიერებაში. პასუხისთვის იყენებს სერვისების შვიდი გვერდის ფასებსა და ინფორმაციას; ამ ფუნქციით შეკითხვის ტექსტი და საუბარი არც ჩვენს სერვერს და არც გარე AI მომწოდებელს არ ეგზავნება.',
          'ასისტენტი საუბარს არ წერს ბრაუზერის მუდმივ ან სესიის საცავში და არ ქმნის საუბრის სესიის იდენტიფიკატორს. ფოტოს ან სხვა ფაილის ატვირთვა ამ ვერსიაში არ არის. გარე AI სერვისის ჩართვის შემთხვევაში მონაცემების გადაცემის პირობები წინასწარ განახლდება.',
          'ასისტენტს არ გაუზიაროთ პაროლები, საბანკო მონაცემები, საიდენტიფიკაციო დოკუმენტები ან სხვა პირის კონფიდენციალური ინფორმაცია.',
        ] },
        { id: 'service-status', title: 'სერვისის სტატუსის შემოწმება', paragraphs: [
          'სტატუსის საძიებო ველში შეყვანილი სერვისის კოდი ან ტელეფონის ნომერი გამოიყენება შესაბამისი ჩანაწერის მოსაძებნად. შეიყვანეთ მხოლოდ თქვენი მოწყობილობის სერვისის კოდი ან თქვენი საკონტაქტო ნომერი.',
          'სერვისის კოდი და ძიების შედეგად მიღებული პირადი ინფორმაცია არ გაუზიაროთ სხვა პირებს. შეკვეთის მდგომარეობის ან მონაცემებთან დაკავშირებული საკითხის დასაზუსტებლად დაგვიკავშირდით.',
        ] },
        { id: 'browser-storage', title: 'ბრაუზერის მეხსიერება და ტექნიკური მონაცემები', paragraphs: [
          'შესვლის შემდეგ კაბინეტი ავტორიზაციის შესანარჩუნებლად იყენებს „tecservice_session“ cookie-ს. იგი შეიცავს სესიის ტექნიკურ გასაღებს და არა თქვენს პაროლს; HttpOnly პარამეტრი გვერდის JavaScript-ს მის წაკითხვას უზღუდავს.',
          'სერვერზე სესიის ჩანაწერი მოიცავს ტექნიკური გასაღების ჰეშს, ანგარიშის იდენტიფიკატორს, შექმნისა და მოქმედების დასრულების დროს და ბრაუზერის ტექნიკურ აღწერას. ეს მონაცემები გამოიყენება ავტორიზაციის შემოწმებისა და სესიების მართვისთვის.',
          'ანგარიშიდან გამოსვლა აუქმებს მიმდინარე შესვლას. Cookie-ების დაბლოკვის ან წაშლის შემთხვევაში შესაძლოა ხელახლა შესვლა დაგჭირდეთ. სატესტო ასისტენტის საუბარი ამ cookie-ში არ ინახება.',
          'სერვერს შეიძლება ჰქონდეს ტექნიკური ჟურნალები, მათ შორის IP მისამართისა და მოთხოვნის დროის შესახებ. ჰოსტინგის რეალური პარამეტრები და შენახვის ვადა ამ ვერსიაში ჯერ დადასტურებული არ არის.',
        ] },
        { id: 'external-services', title: 'რუკა და გარე სერვისები', paragraphs: [
          'ზოგ გვერდზე ჩაშენებული Google Maps-ის ჩატვირთვისას ბრაუზერი პირდაპირ უკავშირდება Google-ს და გადასცემს კავშირის ტექნიკურ ინფორმაციას. გარე სერვისმა შესაძლოა საკუთარი მეხსიერება ან cookies გამოიყენოს.',
          'WhatsApp-ის, სოციალური ქსელებისა და მაღაზიის ბმულებზე გადასვლისას მოქმედებს შესაბამისი სერვისის მონაცემთა დაცვის წესებიც. მხოლოდ გარე ბმულის არსებობა არ ნიშნავს, რომ თქვენს მიერ ფორმაში ჩაწერილი ინფორმაცია იქ ავტომატურად იგზავნება.',
        ] },
        { id: 'public-reviews', title: 'საჯარო შეფასებები', paragraphs: [
          'მთავარ გვერდზე გამოქვეყნებულია Google-ის საჯარო შეფასებები ავტორის სახელით, ქულით, ტექსტითა და თარიღით. თუ გამოქვეყნებული შეფასება თქვენ გეკუთვნით და მასთან დაკავშირებით კითხვა გაქვთ, დაგვიკავშირდით.',
        ] },
        { id: 'product-comments', title: 'პროდუქტის კომენტარების საჯაროობა', paragraphs: [
          'პროდუქტზე კომენტარის გამოქვეყნება ნებაყოფლობითია. საჯაროდ ჩანს კომენტარის ტექსტი, ანგარიშის სახელიდან მიღებული ავტორის სახელი და თარიღი, შესაბამის პროდუქტთან ერთად. კომენტარის ნახვა შეუძლია საიტის სხვა ვიზიტორსაც, ავტორიზაციის გარეშე.',
          'კომენტარი სერვერზე უკავშირდება თქვენს ანგარიშსა და პროდუქტს, რათა საკუთარი კომენტარის მართვა შეძლოთ. ტელეფონის ნომერი, ელფოსტა, პირადი ნომერი, მისამართები და შეკვეთების ინფორმაცია კომენტარის საჯარო მონაცემებში არ შედის; თუმცა თავად ტექსტში ჩაწერილი ინფორმაცია საჯაროდ გამოჩნდება.',
          'კაბინეტის „ჩემი კომენტარების“ განყოფილებიდან შეგიძლიათ საკუთარი კომენტარის რედაქტირება ან წაშლა. წაშლის შემდეგ იგი საიტის კომენტარების სიაში აღარ გამოჩნდება; ეს ვერ შლის სხვა პირის მიერ მანამდე შენახულ ასლს ან ეკრანის სურათს. Google-ის შეფასებასთან დაკავშირებული კითხვით ცალკე დაგვიკავშირდით.',
        ] },
        { id: 'retention', title: 'შენახვა და წვდომა', paragraphs: [
          'შეკვეთების ისტორია ინახება შეკვეთის დასრულებიდან 5 წლის განმავლობაში.',
          'ეს ვადა ეხება მხოლოდ შეკვეთების ისტორიას და არ ვრცელდება მოწყობილობიდან აღდგენილ პირად ფაილებზე.',
          'მოწყობილობიდან აღდგენილი პირადი ფაილები ინახება მომხმარებლისთვის გადაცემიდან 1 კვირის განმავლობაში.',
          'შეკვეთების სისტემაში მომხმარებლის სრულ საკონტაქტო მონაცემებზე წვდომა აქვთ მხოლოდ ფილიალის მენეჯერებსა და ხელმძღვანელს. ტექნიკოსებისთვის ხელმისაწვდომია მხოლოდ მომხმარებლის სახელი და მოწყობილობის დასახელება.',
          'შეკვეთების ისტორიის 5-წლიანი ვადა ავტომატურად არ ვრცელდება ანგარიშზე, შენახულ მისამართებზე, საჯარო კომენტარებზე ან ტექნიკურ ჟურნალებზე. ამ კატეგორიების შენახვის კონკრეტული ვადები და შესაბამისი დამუშავების საფუძვლები კომპანიის მიერ დასაზუსტებელია. შენახვასა და წაშლაზე კითხვით შეგიძლიათ დაგვიკავშირდეთ.',
        ] },
        { id: 'rights', title: 'თქვენი უფლებები და კითხვები', paragraphs: [
          'მოქმედი კანონით გათვალისწინებულ ფარგლებში შეგიძლიათ მოითხოვოთ ინფორმაცია თქვენი მონაცემების დამუშავებაზე, მათზე წვდომა, გასწორება ან წაშლა. თანხმობაზე დაფუძნებული დამუშავებისას შეგიძლიათ თანხმობის გამოთხოვაც. კონკრეტულ მოთხოვნას შესაძლოა კანონით განსაზღვრული პირობები ან გამონაკლისები ახლდეს.',
          'მოთხოვნისთვის დაგვიკავშირდით ტელეფონით ან კონტაქტის გვერდზე მითითებული გზით. სხვისი მონაცემების გაცემის თავიდან ასაცილებლად შეიძლება საჭირო გახდეს თქვენი ვინაობის სათანადო გადამოწმება. ასევე შეგიძლიათ გამოიყენოთ კანონით გათვალისწინებული გასაჩივრების გზები.',
        ] },
      ],
    },
  },
  en: {
    terms: {
      title: 'Terms of service',
      description: 'TECSERVICE service terms: diagnostics, prices, device handover, customer accounts and public product comments.',
      intro: 'Practical information about agreeing service work, your customer account and using website features.',
      sections: [
        { id: 'scope', title: 'The website and our services', paragraphs: [
          'TECSERVICE services are provided by Skynet Distribution LLC, identification number 427740000. This website presents services, indicative prices and contact details. Device acceptance and the terms of a particular job are agreed individually with the service centre.',
          'An online description or AI assistant response does not replace a physical inspection and is not a final diagnosis or a guarantee of successful repair.',
        ] },
        { id: 'diagnostics', title: 'Diagnostics and agreement', paragraphs: [
          'When bringing in a device, provide the exact model, a description of the fault and any previous damage or repair history. The diagnostic fee and its payment conditions are agreed with the customer in advance.',
          'If the cause of the fault has been identified, repair is possible and the customer declines the repair because of the quoted price, the diagnostic fee is payable. If the cause of the fault cannot be identified, diagnostics are free of charge.',
          'In other cases, diagnostic payment conditions are agreed individually before work begins.',
          'The scope of work, required parts and price are agreed after inspection. Any changes following the discovery of further damage also need to be agreed.',
        ] },
        { id: 'prices', title: 'Prices and estimated timeframes', paragraphs: [
          'A price marked “from” is an indicative starting price. The final amount depends on the model, fault, work and required parts. Check whether the quote includes the cost of parts.',
          'Timeframes are estimates and depend on diagnostic findings, workload and parts availability. Confirm a particular completion date with the service centre.',
        ] },
        { id: 'device-data', title: 'Your device and data', paragraphs: [
          'If the device allows it, back up important data before handing it over. Tell us at check-in if data preservation or recovery is needed.',
          'Do not send passwords, bank details or private files through a public form or the AI assistant. Agree any necessary device access and a safe way to provide it directly with a specialist.',
        ] },
        { id: 'handover', title: 'Results and handover', paragraphs: [
          'The availability, duration and terms of any additional warranty are determined individually, depending on the particular work and parts used. Customers are informed of these terms before the repair begins. On request, warranty terms are provided in writing or another form acceptable to you.',
          'At handover, review the work performed and the test results. The absence of an additional warranty does not limit the customer’s statutory rights.',
          'Contact us using the details below with any service question or complaint. Provide your service code and describe the issue so that it can be reviewed; you do not need to send passwords or private files for this purpose.',
        ] },
        { id: 'online-tools', title: 'Online features', paragraphs: [
          'Your service code is intended to help you obtain information about your device’s service. Keep it safe and do not share it with others. Contact us to clarify the status of your order or the handover time.',
          'The assistant currently runs in trial mode: it prepares responses in your browser using prices and information published on the seven service pages. It provides indicative guidance, not a device diagnosis, a final quote or an order booking. Photo upload is not available in this version.',
          'Before placing an order in the shop, review the product description, price, payment and delivery terms. When using the shop or another external website, the rules stated on that website apply.',
        ] },
        { id: 'customer-account', title: 'Registration and account security', paragraphs: [
          'To register, provide your full name, a valid mobile number and a password. A mobile number is required; email is optional. A new account can be used after our team has checked and approved it.',
          'Use your own details and do not create an account in another person’s name. Keep your password private and sign out after using a shared device. Contact us if you have an access problem or notice suspicious activity.',
          'The mobile number provided at registration cannot be changed from your account. Contact our team to change it; identity verification may be needed to protect your account and orders.',
        ] },
        { id: 'account-records', title: 'Your account and documents', paragraphs: [
          'In your account you can update profile details, optionally add a personal identification number, add or remove addresses and change your password. Certain changes require confirmation with your current password.',
          'Your account provides access to associated services, purchases and issued invoices. Opening or downloading a document does not itself mean that payment has been made. If a status, amount or record appears incorrect, contact us with the relevant reference number.',
          'Use only your own records and documents. Do not publicly share private account information or downloaded invoices. The add-card and remember-card section is currently visual only: it does not store a card or process a payment.',
        ] },
        { id: 'product-comments', title: 'Public product comments', paragraphs: [
          'With an approved account you can post a public product comment. It appears on the product page with an author name and date; this is not a private conversation with our team. You can edit or delete your own comment in the “My comments” section of your account.',
          'Comments should relate to the product and reflect your experience or question. Do not post spam, threats, abusive or unlawful content, another person’s private information, passwords, phone numbers or payment details.',
          'Contact us if a comment contains your personal data or a possible breach of these rules, identifying the product and comment. You do not need to publish further personal information for us to review the matter.',
        ] },
      ],
    },
    privacy: {
      title: 'Privacy policy',
      description: 'How TECSERVICE uses account details, addresses, order records and public comments; retention and the trial assistant.',
      intro: 'How the current website features work and what to consider before sharing information.',
      sections: [
        { id: 'contact-data', title: 'When you contact us', paragraphs: [
          'If you contact us by phone or WhatsApp, the number, message and device details you share may be used to answer your enquiry and arrange service. Please share only what is needed to explain the issue.',
          'Where data is necessary to arrange service at your request or carry out agreed work, it is processed on the basis of taking steps to enter into a service agreement or performing that agreement with you. Without the necessary contact or device information, we may be unable to arrange service or contact you about your order.',
          'The website is operated by Skynet Distribution LLC, identification number 427740000. You can contact TECSERVICE on +995 591 47 40 40 or at the service centre: 7b/2 Tsotne Dadiani Street, Tbilisi.',
        ] },
        { id: 'customer-account', title: 'Registration and profile information', paragraphs: [
          'Registration processes your full name, required mobile number and email if you choose to provide it. These details are used to create an account, allow our team to review it, authenticate you and connect you with your services.',
          'Your password is checked on the server for sign-in and protected account changes; the account record stores a password hash, not the plain text. Do not include passwords in comments, assistant messages or messages to support.',
          'Adding a personal identification number to your profile is optional and is not required for registration. If provided, it is stored with your profile. Check in advance whether it is needed for a particular service or document; do not enter another person’s identification details.',
          'The address label, city and street address you add are stored with your account so that you can manage them there. Saving an address does not itself book a delivery or automatically pass the address to a courier.',
        ] },
        { id: 'account-records', title: 'Services, purchases and invoices', paragraphs: [
          'Your account displays the associated service code, device or product information, status, dates, price and available invoices. This information is used to show your service and purchase history and provide access to the relevant documents.',
          'Sign-in is required to access your account and invoices. Profile information, addresses and private documents are not published with public product comments. A downloaded document also leaves a copy on your device, and you control how that copy is shared.',
          'The current visual add-card and remember-card form does not collect card numbers, expiry dates or CVVs, store bank cards or process payments. Information about the provider and data processing will be updated before a real banking feature is enabled.',
        ] },
        { id: 'assistant', title: 'Trial assistant', paragraphs: [
          'The trial assistant processes your problem description and selected category in your browser, in the current page’s temporary memory. It uses prices and information from the seven service pages to respond; this feature does not send your question or conversation to our server or an external AI provider.',
          'The assistant does not write conversations to persistent browser storage or session storage and does not create a conversation session identifier. Photo and other file uploads are unavailable in this version. Data-transfer information will be updated in advance if an external AI service is enabled.',
          'Do not share passwords, bank details, identity documents or another person’s confidential information with the assistant.',
        ] },
        { id: 'service-status', title: 'Checking your service status', paragraphs: [
          'The service code or phone number entered in the status search is used to find a matching record. Enter only your own device’s service code or your own contact number.',
          'Do not share your service code or personal information shown in the search results with others. Contact us to clarify your order status or any data-related question.',
        ] },
        { id: 'browser-storage', title: 'Browser storage and technical data', paragraphs: [
          'After sign-in, your account uses a “tecservice_session” cookie to maintain authentication. It contains a technical session token, not your password; the HttpOnly setting prevents page JavaScript from reading it.',
          'The server-side session record includes a hash of the token, an account identifier, creation and expiry times and a technical browser description. These details are used to check authentication and manage sessions.',
          'Signing out ends the current sign-in. Blocking or deleting cookies may require you to sign in again. Trial-assistant conversations are not stored in this cookie.',
          'The server may keep technical logs, including IP addresses and request times. The actual hosting configuration and retention period have not yet been confirmed for this draft.',
        ] },
        { id: 'external-services', title: 'Maps and external services', paragraphs: [
          'When an embedded Google Map loads on some pages, your browser connects directly to Google and sends technical connection information. The external service may use its own storage or cookies.',
          'Following WhatsApp, social-media or shop links also brings you under the destination’s privacy practices. An external link alone does not automatically send information you entered in a form to that destination.',
        ] },
        { id: 'public-reviews', title: 'Public reviews', paragraphs: [
          'The homepage republishes public Google reviews with the author’s name, rating, text and date. Contact us if a displayed review belongs to you and you have a question about it.',
        ] },
        { id: 'product-comments', title: 'Visibility of product comments', paragraphs: [
          'Posting a product comment is optional. Its text, an author name derived from your account name and a date are public alongside the relevant product. Other website visitors can read comments without signing in.',
          'The server links the comment to your account and the product so that you can manage your own comment. Phone numbers, email addresses, personal identification numbers, saved addresses and order details are not included in public comment data; however, information you enter in the comment text will be public.',
          'You can edit or delete your own comment in the “My comments” section of your account. Once deleted, it no longer appears in the website’s comment lists; this cannot remove copies or screenshots previously saved by someone else. Contact us separately about a Google review.',
        ] },
        { id: 'retention', title: 'Retention and access', paragraphs: [
          'Order history is retained for 5 years after the order is completed.',
          'This period applies only to order history, not to personal files recovered from a device.',
          'Personal files recovered from a device are retained for 1 week after they are handed over to the customer.',
          'Within the order-management system, full customer contact details are accessible only to branch managers and the head of the company. Technicians can see only the customer’s name and the device name.',
          'The five-year order-history period does not automatically apply to accounts, saved addresses, public comments or technical logs. Specific retention periods and processing grounds for these categories need confirmation by the business. Contact us with questions about retention or deletion.',
        ] },
        { id: 'rights', title: 'Your rights and questions', paragraphs: [
          'Within the scope of applicable law, you may request information about processing, access to your data, correction or deletion. You may also withdraw consent where processing relies on consent. Particular requests may be subject to legal conditions or exceptions.',
          'Make a request by phone or through the contact methods on our contact page. Appropriate identity verification may be needed to avoid disclosing another person’s data. You may also use the complaint procedures provided by law.',
        ] },
      ],
    },
  },
}
