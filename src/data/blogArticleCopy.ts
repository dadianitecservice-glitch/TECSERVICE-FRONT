import type { BlogSection } from "./blogPosts.ts";

interface ArticleBody {
  takeaway: string;
  sections: BlogSection[];
  sources: Array<{ label: string; url: string }>;
}

interface BilingualArticle {
  categoryId: string;
  readMinutes: number;
  serviceHref: string;
  ka: ArticleBody;
  en: ArticleBody & { title: string; excerpt: string; imageAlt: string };
}

export const blogArticleCopy: Record<string, BilingualArticle> = {
  "sd-card-photo-recovery-for-photographers": {
    categoryId: "data", readMinutes: 6, serviceHref: "/services/data-recovery/",
    ka: {
      takeaway: "თუ SD ბარათიდან ფოტოები გაქრა, შეწყვიტეთ მასზე გადაღება და არ დააფორმატოთ. შეინახეთ ბარათი უსაფრთხოდ — აღდგენის შესაძლებლობა დაზიანების ტიპსა და შემდგომ ჩაწერებზეა დამოკიდებული; სრული შედეგი გარანტირებული არ არის.",
      sections: [
        {
          id: "missing-photos", title: "გადაღება დასრულდა, მაგრამ კადრები აღარ ჩანს",
          paragraphs: [
            "ქორწილი, ღონისძიება თუ კომერციული ფოტოსესია — არის კადრები, რომლებსაც მეორედ ვეღარ გადაიღებთ. ამიტომ განსაკუთრებით რთულია მომენტი, როცა კამერა ბარათის შეცდომას აჩვენებს, კომპიუტერი დაფორმატებას გთავაზობთ ან გადაღებული ფოტოები საქაღალდეში აღარ ჩანს.",
            "ეს ჯერ კიდევ არ ნიშნავს, რომ ყველა კადრი საბოლოოდ დაკარგულია. ფოტოგრაფები SD ბარათს ხშირად „ჩიპს“ უწოდებენ, თუმცა „ჩიპი დაზიანდა“ ზუსტი დიაგნოზი არ არის. პრობლემა შეიძლება ფაილების წაშლას, ფაილურ სისტემას ან თვითონ ბარათის ფიზიკურ დაზიანებას უკავშირდებოდეს. პირველი ამოცანაა არსებული მდგომარეობის შენარჩუნება, და არა ბარათის სასწრაფოდ სამუშაოდ დაბრუნება.",
          ],
        },
        {
          id: "first-steps", title: "პირველი ნაბიჯები — დაიცავით დარჩენილი ინფორმაცია",
          paragraphs: [
            "აღდგენის შანსის შესანარჩუნებლად პირველ რიგში ახალი ჩაწერა უნდა შეჩერდეს. დაკარგული ფაილების ადგილას გადაღებულმა ახალმა მასალამ ძველი მონაცემები შეიძლება გადაწეროს. დარჩენილი ფოტოსესია სხვა, გამართული ბარათით გააგრძელეთ.",
          ],
          bullets: [
            "შეწყვიტეთ გადაღება. ბარათის ამოღებამდე დარწმუნდით, რომ კამერამ ჩაწერა დაასრულა, შემდეგ გამორთეთ მოწყობილობა და მიჰყევით მის ინსტრუქციას.",
            "არ დაეთანხმოთ კამერის ან კომპიუტერის შეთავაზებას ბარათის დაფორმატებაზე.",
            "გამოყენებული ბარათი ცალკე დამცავ ყუთში მოათავსეთ და მონიშნეთ, რომ შემთხვევით ისევ არ გადაიღოთ მასზე.",
            "სხვა მოწყობილობიდან შეამოწმეთ უკვე არსებული ასლები: მეორე ბარათი, კომპიუტერი, გარე დისკი ან ღრუბლოვანი საცავი.",
          ],
        },
        {
          id: "card-damage", title: "წაშლილი ფაილები თუ ფიზიკურად დაზიანებული ბარათი?",
          paragraphs: [
            "შემთხვევით წაშლილი კადრები და დაზიანებული ფაილური სისტემა ერთი და იგივე არ არის, მაგრამ ორივე შემთხვევაში ბარათზე ინფორმაციის ნაწილი შეიძლება ჯერ კიდევ არსებობდეს. მხოლოდ ცარიელი საქაღალდე, შეცდომის შეტყობინება ან დაფორმატების მოთხოვნა მიზეზის დასადგენად საკმარისი არ არის.",
            "გაბზარული, მოღუნული ან დასველებული SD თუ microSD ბარათი კამერაში ან წამკითხველში ხელახლა არ მოათავსოთ. თუ ბარათი ხან იკითხება და ხან ქრება, აღდგენის პროგრამებით განმეორებითი ექსპერიმენტების ნაცვლად შეწყვიტეთ მცდელობები და მოითხოვეთ შეფასება. პროგრამა გატეხილ კორპუსს ან დაზიანებულ ელექტრონულ კომპონენტს ვერ შეაკეთებს; სპეციალისტის ჩარევაც ყველა შემთხვევაში წარმატებას არ ნიშნავს.",
          ],
        },
        {
          id: "avoid-mistakes", title: "რას უნდა მოერიდოთ აღდგენამდე",
          paragraphs: [
            "ბარათის გამართვა და ფოტოების გადარჩენა სხვადასხვა მიზანია. თუ მასალა მნიშვნელოვანია, შეფასებამდე ნუ გაუშვებთ ავტომატურ შეკეთებას ან ფორმატირებას. დაფორმატების შედეგი მეთოდსა და მოწყობილობაზეა დამოკიდებული: მაგალითად, SD Association-ის პროგრამაში Quick Format და Overwrite Format მონაცემებს ერთნაირად არ ამუშავებს. ეს არ ნიშნავს, რომ კამერაში „სწრაფი ფორმატირება“ აღდგენის უსაფრთხო ნაბიჯია.",
          ],
          bullets: [
            "არ გადაიღოთ საცდელი ფოტო და არ ჩაწეროთ ახალი ფაილები დაზიანებულ ბარათზე.",
            "აღდგენილი მასალა შეინახეთ სხვა გამართულ დისკზე და არა იმავე SD ბარათზე.",
            "არ გახსნათ ბარათის კორპუსი, არ გააცხელოთ და არ სცადოთ კონტაქტების თვითნებური დამუშავება.",
            "თუ ბარათი უკვე დააფორმატეთ, აღარ გაიმეოროთ პროცედურა — ჩაინიშნეთ, სად და როგორ მოხდა ეს.",
          ],
        },
        {
          id: "recoverable-formats", title: "შესაძლებელია RAW, JPEG და ვიდეოს აღდგენა?",
          paragraphs: [
            "ზოგ შემთხვევაში შესაძლებელია როგორც JPEG ფოტოების, ისე RAW ფაილებისა და ვიდეოს აღდგენა. თუმცა მხარდაჭერა კამერის მოდელზე, ფაილის ფორმატსა და აღდგენის მეთოდზეა დამოკიდებული. ერთი პროგრამის მიერ კონკრეტული RAW ფორმატის მხარდაჭერა არ ნიშნავს, რომ ის ყველა კამერისა და ყველა ბარათის მასალას აღადგენს.",
            "ნაპოვნი ფაილის სახელი ან პატარა წინასწარი ხედი ჯერ კიდევ არ ადასტურებს ორიგინალის მთლიანობას. მიღებული ფოტო სრულ ზომაზე უნდა გაიხსნას, ვიდეო კი დაკვრისას შემოწმდეს. ძლიერ დაზიანებული ან ახალი მონაცემებით გადაწერილი მასალა შეიძლება ვეღარ აღდგეს. წინასწარი დაპირება, რომ „ყველა კადრი აუცილებლად დაბრუნდება“, სანდო შეფასებას ვერ შეცვლის.",
          ],
        },
        {
          id: "assessment", title: "რა ინფორმაცია მოამზადოთ შეფასებისთვის",
          paragraphs: [
            "კარგი შეფასება შემთხვევის ისტორიით იწყება. სპეციალისტისთვის მნიშვნელოვანია არა მხოლოდ ბარათის წარწერა, არამედ ისიც, რა მოხდა ფოტოების გაქრობამდე და შემდეგ. თუ ნაწილი უკვე გადმოწერილი გაქვთ, გამოყავით, კონკრეტულად რომელი გადაღება ან დროის მონაკვეთი გაკლიათ.",
          ],
          bullets: [
            "კამერის მოდელი; ბარათის ბრენდი, მოცულობა და ტიპი — SD თუ microSD.",
            "რა შეცდომა გამოჩნდა და როდის იკითხებოდა ბარათი ბოლოს გამართულად.",
            "წაიშალა თუ არა ფაილები, დაფორმატდა თუ არა ბარათი და გაგრძელდა თუ არა მასზე გადაღება.",
            "რომელი პროგრამები გამოიყენეთ ან შეკეთების რა მცდელობები ჩაატარეთ და ხომ არ დასველდა ან დაზიანდა ბარათი.",
            "რომელია პრიორიტეტული მასალა: RAW, JPEG, ვიდეო ან კონკრეტული ღონისძიების კადრები.",
          ],
        },
        {
          id: "next-shoot", title: "როგორ დაიცვათ შემდეგი გადაღება",
          paragraphs: [
            "ორი ბარათის სლოტი თავისთავად სარეზერვო ასლს არ ნიშნავს. თუ კამერა მხარს უჭერს, აირჩიეთ ერთი და იმავე მასალის ორივე ბარათზე ჩაწერა — Backup. Overflow მხოლოდ პირველი ბარათის შევსების შემდეგ გადადის მეორეზე. RAW-ისა და JPEG-ის სხვადასხვა ბარათზე განაწილებაც ორივე ორიგინალის დუბლირება არ არის. ვიდეოს პარალელური ჩაწერის შესაძლებლობა ცალკე გადაამოწმეთ თქვენი მოდელის ინსტრუქციაში.",
            "გადაღების შემდეგ შეინახეთ მასალა დამოუკიდებელ საცავებშიც და გადაამოწმეთ, რომ ასლები ნამდვილად იხსნება. მხოლოდ ამის შემდეგ მოამზადეთ ბარათი შემდეგი სამუშაოსთვის კამერის ინსტრუქციის მიხედვით. ბარათს ნუ გამოიყენებთ არქივის ერთადერთ ადგილად — სამუშაო დღის დასრულებას გადაღებული მასალის უსაფრთხოდ შენახვაც უნდა მოჰყვეს.",
          ],
        },
        {
          id: "get-help", title: "SD ბარათის შეფასება TECSERVICE-ში",
          paragraphs: [
            "თუ SD ბარათი აღარ იკითხება ან მნიშვნელოვანი ფოტოები და ვიდეო გაქრა, დაუკავშირდით TECSERVICE-ს მონაცემების აღდგენის საკითხზე. მოგვაწოდეთ ბარათისა და კამერის მონაცემები, აღწერეთ შემთხვევა და უკვე ჩატარებული მცდელობები. მომსახურების შესახებ ინფორმაციას ამ გვერდის სერვისის ბმულით ნახავთ.",
            "კონკრეტული შემთხვევის აღდგენის შესაძლებლობა, ფასი და ვადა ინდივიდუალურ შეფასებას საჭიროებს. სანამ ბარათს მოიტანთ, აღარ გამოიყენოთ იგი გადაღებისთვის და ნუ სცდით მის ფორმატირებას. ყველაზე ღირებული ნაბიჯი ახლა ისაა, რომ დარჩენილი მასალა დამატებითი ცვლილებებისგან დაიცვათ.",
          ],
        },
      ],
      sources: [],
    },
    en: {
      title: "SD card photo recovery: a photographer’s guide",
      excerpt: "Camera cannot read your SD card or photos have disappeared? Learn the first steps, mistakes to avoid and what affects RAW, JPEG and video recovery.",
      imageAlt: "SD memory card and card reader beside a camera",
      takeaway: "If photos disappear from an SD card, stop shooting on it and do not format it. Keep the card safe: recovery depends on the fault and subsequent writes, and complete recovery is never guaranteed.",
      sections: [
        {
          id: "missing-photos", title: "The shoot is over, but the images are missing",
          paragraphs: [
            "A wedding, an event or a commercial shoot can contain moments you cannot capture twice. Finding a card error on the camera, a format prompt on the computer or an unexpectedly empty folder is a difficult way to end that working day.",
            "It does not automatically mean every image is gone for good. A card error does not, by itself, confirm that the memory chip is physically damaged. Deleted files, a damaged file system and physical card damage are different problems. The first priority is to preserve what remains, not to make the card ready for another shoot.",
          ],
        },
        {
          id: "first-steps", title: "First steps: protect the remaining data",
          paragraphs: [
            "Preventing new writes is the first precaution. Further shooting can overwrite data that might otherwise be recoverable. Use a different, working card if you need to finish the assignment, and set the affected one aside.",
          ],
          bullets: [
            "Stop shooting. Before removing the card, ensure the camera has finished writing; then switch it off and follow its removal instructions.",
            "Decline any camera or computer prompt to format the card.",
            "Put the affected card in a separate protective case and label it so it is not accidentally used again.",
            "Use another device to check existing copies on a second card, computer, external drive or cloud storage.",
          ],
        },
        {
          id: "card-damage", title: "Deleted files or a physically damaged card?",
          paragraphs: [
            "Accidental deletion and file-system corruption are different faults, but some data may still be present in either case. An empty folder, an error message or a request to format the card does not identify the cause on its own.",
            "Do not reinsert a cracked, bent or wet SD or microSD card into a camera or reader. If detection comes and goes, stop further attempts and request an assessment rather than repeatedly trying recovery applications. Software cannot repair a broken casing or a damaged electronic component, and specialist intervention does not guarantee success either.",
          ],
        },
        {
          id: "avoid-mistakes", title: "What to avoid before recovery",
          paragraphs: [
            "Restoring a card to use and preserving lost photographs are different goals. For valuable material, avoid automatic repair operations or formatting before assessment. Formatting behaviour varies: the SD Association’s utility distinguishes Quick Format from Overwrite Format. That distinction is not a reason to treat a camera’s quick-format option as a safe recovery step.",
          ],
          bullets: [
            "Do not take test shots or copy new files onto the affected card.",
            "Save recovered material to another healthy drive, never back onto the source SD card.",
            "Do not open or heat the card, or attempt improvised work on its contacts.",
            "If you have already formatted it, do not repeat the operation; record which device and method were used.",
          ],
        },
        {
          id: "recoverable-formats", title: "Can RAW, JPEG and video files be recovered?",
          paragraphs: [
            "Recovery can sometimes include JPEG images, RAW files and video, but support depends on the camera, file format and recovery method. An application supporting one RAW format does not establish compatibility with every camera or card.",
            "A recovered filename or thumbnail is not proof of an intact original. Open photographs at full size and check video playback. Severe corruption or overwritten data may prevent recovery. A promise that every frame will definitely return is not a substitute for an assessment.",
          ],
        },
        {
          id: "assessment", title: "What to prepare for an assessment",
          paragraphs: [
            "A useful assessment starts with the history of the incident, not just the information printed on the card. Explain what happened before the files disappeared and what you did afterwards. If you already copied some material, identify the missing shoot or time period as precisely as possible.",
          ],
          bullets: [
            "Camera model, card brand and capacity, and whether it is SD or microSD.",
            "The error you saw and when the card last worked normally.",
            "Whether files were deleted, the card was formatted or shooting continued after the loss.",
            "Any recovery applications or repair attempts already used, plus any liquid or physical damage.",
            "Your priority material: RAW photographs, JPEGs, video or images from a particular event.",
          ],
        },
        {
          id: "next-shoot", title: "Protecting the next shoot",
          paragraphs: [
            "Two card slots do not automatically create a backup. Where supported, select Backup to duplicate the same material. Overflow moves to the second card when the first fills up; splitting RAW and JPEG across cards is not a duplicate of both originals either. Check your own camera’s manual separately for simultaneous video recording support.",
            "After the shoot, keep copies on independent storage and verify that they open before preparing the card for reuse according to the camera’s instructions. The card should not be your only archive. Make safeguarding the day’s material part of finishing the assignment, not an optional task for later.",
          ],
        },
        {
          id: "get-help", title: "SD card assessment at TECSERVICE",
          paragraphs: [
            "If an SD card is unreadable or important photographs and footage are missing, contact TECSERVICE about data recovery. Share the card and camera details, describe the incident and explain any previous attempts. The service link on this page leads to more information about data recovery.",
            "Recovery options, cost and timing require an individual assessment. Before bringing the card in, stop using it for photography and do not try formatting it. The most useful action now is to protect the remaining material from further changes.",
          ],
        },
      ],
      sources: [],
    },
  },
  "lost-files-first-minutes": {
    categoryId: "data", readMinutes: 3, serviceHref: "/services/data-recovery/",
    ka: {
      takeaway: "შეწყვიტეთ ახალი ინფორმაციის ჩაწერა იმ დისკზე, საიდანაც ფაილები დაიკარგა. აღდგენის შედეგი მატარებლის მდგომარეობასა და დაკარგვის მიზეზზეა დამოკიდებული.",
      sections: [
        { id: "pause", title: "ჯერ შეაჩერეთ ახალი ჩაწერა", paragraphs: ["ფაილების გაქრობა ყოველთვის არ ნიშნავს, რომ მათი შიგთავსი მაშინვე წაიშალა. თუმცა დისკზე მუშაობის გაგრძელებამ შეიძლება სწორედ ის ადგილი გამოიყენოს, სადაც საჭირო ინფორმაცია ინახებოდა. შეწყვიტეთ ჩამოტვირთვა, პროგრამების დაყენება და ფაილების კოპირება ამ მატარებელზე. აღდგენის პროგრამაც სხვა, გამართულ მოწყობილობაზე უნდა მოამზადოთ."] },
        { id: "check-copies", title: "შეამოწმეთ უკვე არსებული ასლები", paragraphs: ["თუ მოწყობილობას ფიზიკური დაზიანების ნიშნები არ აქვს, გაარკვიეთ, ფაილი შემთხვევით სხვა საქაღალდეში ხომ არ გადაიტანეთ. სარეზერვო ასლები და ღრუბლოვანი სერვისის წაშლილი ფაილების განყოფილება სასურველია სხვა მოწყობილობიდან შეამოწმოთ. გაითვალისწინეთ, სინქრონიზაციამ წაშლა სხვა მოწყობილობაზეც შეიძლება გაიმეოროს."], bullets: ["მოინიშნეთ ფაილების სახელები, ტიპები და ბოლო ცნობილი მდებარეობა.", "ჩაიწერეთ, როდის გაქრა ინფორმაცია და რა მოქმედება უსწრებდა წინ."] },
        { id: "warning-signs", title: "როდის აღარ უნდა სცადოთ ხელახლა", paragraphs: ["უჩვეულო კაკუნი, დამწვრის სუნი, დაცემის შემდეგ გაუმართაობა ან ხშირი გათიშვა დამატებითი ექსპერიმენტების შეწყვეტის მიზეზია. ასეთ დისკს ნუ ჩართავთ განმეორებით შესამოწმებლად. არ გახსნათ მყარი დისკის დახურული კორპუსი, არ გააცხელოთ და არ მოათავსოთ საყინულეში. პროგრამული სკანირება ფიზიკურ დაზიანებას ვერ გამოასწორებს."] },
        { id: "next-step", title: "მოამზადეთ ინფორმაცია დიაგნოსტიკისთვის", paragraphs: ["სპეციალისტს უთხარით მოწყობილობის მოდელი, დაზიანების ისტორია და უკვე ჩატარებული მცდელობები. წინასწარ გამოყავით ყველაზე მნიშვნელოვანი ფაილები და მათი სავარაუდო მოცულობა. თუ მატარებელი დაშიფრულია, შეიძლება აღდგენის გასაღებიც დაგჭირდეთ; მას საჯარო მიმოწერაში ნუ გააზიარებთ. აღდგენილი მასალა სხვა დისკზე უნდა ჩაიწეროს. წინასწარ სრული აღდგენის დაპირება სარწმუნო შეფასება არ არის."] },
      ],
      sources: [{ label: "Microsoft — დაკარგული ფაილების აღდგენის პირობები", url: "https://support.microsoft.com/en-us/windows/experience/backup-recovery/windows-file-recovery" }, { label: "Seagate — პირველი ნაბიჯები მონაცემების დაკარგვისას", url: "https://www.seagate.com/files/www-content/services-software/en-gb/docs/data-loss-faq-tp-638-1-1206-gb.pdf" }],
    },
    en: {
      title: "Lost files: what to do in the first few minutes",
      excerpt: "Pause new writes, check existing backups and recognise when a drive needs professional assessment.",
      imageAlt: "Laboratory work on data recovery",
      takeaway: "Stop writing to the affected drive. Recovery depends on the condition of the storage device and what caused the loss.",
      sections: [
        { id: "pause", title: "Pause before trying a recovery tool", paragraphs: ["A missing file is not always immediately erased, but continued use can overwrite the space it occupied. Stop downloads, installations and copying on the affected drive. Do not install a recovery application on that same drive. If this is your system disk, seek advice before continuing everyday work."] },
        { id: "check-copies", title: "Look for an existing copy", paragraphs: ["If there are no signs of physical damage, check whether the file was moved rather than deleted. Prefer a different device when reviewing cloud backups and deleted-item folders. Synchronisation is not the same as a separate backup: a deletion may also reach other devices."], bullets: ["Note the file names, types and last known folder.", "Record when the loss occurred and what happened immediately beforehand."] },
        { id: "warning-signs", title: "Recognise warning signs", paragraphs: ["Clicking, a burning smell, failure after a drop or repeated disconnections call for stopping further attempts. Do not repeatedly power up the drive to check it. Never open a hard drive's sealed enclosure, heat it or put it in a freezer. A software scan cannot repair physical damage."] },
        { id: "next-step", title: "Prepare for an assessment", paragraphs: ["Share the device model, incident history and any recovery attempts already made. Identify which files matter most and their approximate size. Encrypted storage may require a recovery key; do not post it in public messages. Recovered files belong on a separate drive. A reliable assessment cannot promise complete recovery before examining the problem."] },
      ],
      sources: [{ label: "Microsoft: Windows File Recovery", url: "https://support.microsoft.com/en-us/windows/experience/backup-recovery/windows-file-recovery" }, { label: "Seagate: When Data Loss Occurs", url: "https://www.seagate.com/files/www-content/services-software/en-gb/docs/data-loss-faq-tp-638-1-1206-gb.pdf" }],
    },
  },
  "five-reasons-laptop-is-slow": {
    categoryId: "laptops", readMinutes: 3, serviceHref: "/services/laptop-repair/",
    ka: {
      takeaway: "შენელების მიზეზი გაზომვით უნდა დადგინდეს. SSD ან მეტი RAM ყველა პრობლემის უნივერსალური გამოსავალი არ არის.",
      sections: [
        { id: "observe", title: "დააკვირდით, როდის ნელდება", paragraphs: ["მნიშვნელოვანია, პრობლემა ჩართვისას ჩნდება, რამდენიმე პროგრამის ერთად გახსნისას თუ ხანგრძლივი მუშაობის შემდეგ. ჩაიწერეთ კონკრეტული მაგალითი და ბოლო ცვლილებები: ახალი პროგრამა, განახლება ან დატვირთვის ზრდა. მხოლოდ „ნელა მუშაობს“ ჯერ არ გვიჩვენებს, პროგრამული შეფერხება გვაქვს თუ რომელიმე კომპონენტის პრობლემა."] },
        { id: "five-causes", title: "ხუთი გავრცელებული მიმართულება", paragraphs: ["საწყისი შემოწმება ამ ხუთ საკითხს მოიცავს. მათი არსებობა ავტომატურად არ ნიშნავს, რომ დეტალი შესაცვლელია."], bullets: ["ავტომატურად გაშვებული და ფონური პროგრამები რესურსებს იკავებს.", "დისკზე თავისუფალი ადგილის ნაკლებობა მუშაობას აფერხებს.", "მრავალი პროგრამისთვის ოპერატიული მეხსიერება აღარ არის საკმარისი.", "ნელი ან პრობლემური დისკი ფაილებთან მუშაობას აყოვნებს.", "გაგრილების შეფერხებისას დატვირთვის ქვეშ წარმადობა შეიძლება შემცირდეს."] },
        { id: "safe-checks", title: "რა შეგიძლიათ უსაფრთხოდ შეამოწმოთ", paragraphs: ["Task Manager-ში ნახეთ პროცესორის, მეხსიერებისა და დისკის დატვირთვა. დახურეთ მხოლოდ თქვენთვის ცნობილი, არასაჭირო პროგრამები. მნიშვნელოვანი ფაილების სარეზერვო ასლის შექმნის შემდეგ გაათავისუფლეთ დისკი სისტემის ჩაშენებული საშუალებებით. უცნობ „გამაჩქარებლებს“ და რეესტრის ავტომატურ გამწმენდებს ნუ ენდობით. ლეპტოპი დადეთ მყარ ზედაპირზე, რათა ჰაერის შემოსასვლელები არ დაიფაროს."] },
        { id: "upgrade", title: "როდის ღირს განახლება", paragraphs: ["SSD-ის ან RAM-ის შერჩევამდე გადაამოწმეთ ზუსტი მოდელი და განახლების შესაძლებლობა: ზოგ ლეპტოპში მეხსიერება პლატაზეა მირჩილული და ჩვეულებრივ არ იცვლება. თუ შენელებას ხმაური, შეცდომები ან გამორთვაც ახლავს, ჯერ დიაგნოსტიკა სჯობს. სერვისში მოიტანეთ განმეორებადი მაგალითი — რომელი პროგრამა მუშაობს და დაახლოებით რამდენ ხანში ჩნდება შეფერხება. ასე გადაწყვეტილება თქვენს სამუშაოს მოერგება."] },
      ],
      sources: [{ label: "Microsoft — კომპიუტერის წარმადობის გაუმჯობესება", url: "https://support.microsoft.com/en-us/windows/experience/performance-optimization/tips-to-improve-pc-performance-in-windows" }, { label: "Dell — გაგრილება და მოულოდნელი გათიშვა", url: "https://www.dell.com/support/kbdoc/en-us/000130867/how-to-troubleshoot-a-overheating-shutdown-or-thermal-issue-on-a-dell-pc" }],
    },
    en: {
      title: "Slow laptop? Five causes worth checking",
      excerpt: "Background apps, storage, memory and cooling can all affect performance. Start with diagnosis before buying parts.",
      imageAlt: "Technical diagnosis of a laptop",
      takeaway: "Measure the bottleneck before upgrading. A new SSD or more RAM will not solve every performance problem.",
      sections: [
        { id: "observe", title: "Identify when it slows down", paragraphs: ["Does the problem appear at startup, with several applications open or only after prolonged use? Record a specific example and recent changes, such as an installation or increased workload. That context helps distinguish a software delay from a possible hardware issue instead of immediately replacing parts."] },
        { id: "five-causes", title: "Five common areas to investigate", paragraphs: ["These are starting points for diagnosis, not proof that a component needs replacing."], bullets: ["Startup and background applications consume resources.", "Low free storage space can affect normal operation.", "Your workload may exceed the available memory.", "A slow or unhealthy drive can delay file access.", "Restricted cooling can reduce performance under load."] },
        { id: "safe-checks", title: "Begin with safe checks", paragraphs: ["Review CPU, memory and disk activity in Task Manager. Close unnecessary applications you recognise. After protecting important files, use the system's built-in storage tools to free space. Avoid unfamiliar speed-up utilities and automatic registry cleaners. Use a firm surface that leaves the laptop's ventilation openings clear."] },
        { id: "upgrade", title: "Choose an upgrade for the actual problem", paragraphs: ["Check the exact model before choosing an SSD or memory upgrade: some laptops have soldered memory that cannot be replaced. If slowdowns accompany unusual noises, errors or shutdowns, arrange diagnosis first. Bring a repeatable example of the problem, including the application and how long it takes to appear, so the proposed solution matches your work."] },
      ],
      sources: [{ label: "Microsoft: Tips to improve PC performance", url: "https://support.microsoft.com/en-us/windows/experience/performance-optimization/tips-to-improve-pc-performance-in-windows" }, { label: "Dell: Overheating and shutdown issues", url: "https://www.dell.com/support/kbdoc/en-us/000130867/how-to-troubleshoot-a-overheating-shutdown-or-thermal-issue-on-a-dell-pc" }],
    },
  },
  "console-overheating": {
    categoryId: "consoles", readMinutes: 3, serviceHref: "/services/console-repair/",
    ka: {
      takeaway: "ხმამაღალი ვენტილატორი ყოველთვის გაუმართაობას არ ნიშნავს. განმეორებული გამორთვა ან ტემპერატურის გაფრთხილება შემოწმებას საჭიროებს.",
      sections: [
        { id: "symptoms", title: "ხმაური და გადახურება ერთი და იგივე არ არის", paragraphs: ["რთული თამაშის გაშვებისას ვენტილატორი შეიძლება უფრო სწრაფად მუშაობდეს. მარტო ხმაურით გადახურების დასკვნას ვერ გამოვიტანთ. საყურადღებოა ეკრანზე ტემპერატურის გაფრთხილება, განმეორებული გამორთვა ან ადრე ჩვეულებრივად გაშვებულ თამაშში ახალი შეფერხება. ჩაიწერეთ ზუსტი შეტყობინება და რამდენი ხნის თამაშის შემდეგ გამოჩნდა."] },
        { id: "airflow", title: "დატოვეთ სივრცე ჰაერის მოძრაობისთვის", paragraphs: ["კონსოლი დახურულ კარადაში ან სხვა გამთბარ მოწყობილობაზე არ მოათავსოთ. სადგამი და განლაგება კონკრეტული მოდელის ინსტრუქციას უნდა შეესაბამებოდეს. მაგალითად, Sony PS5-ისთვის კედლიდან მინიმუმ 10 სმ დაშორებას უთითებს; სხვა მოდელზე მისი საკუთარი მოთხოვნები გადაამოწმეთ."], bullets: ["არ დაფაროთ სავენტილაციო ღიობები ქსოვილით ან დეკორაციით.", "ხალიჩისა და რბილი ზედაპირის ნაცვლად გამოიყენეთ მყარი ზედაპირი.", "აირჩიეთ კარგად განიავებული ადგილი, პირდაპირი მზისგან მოშორებით."] },
        { id: "cleaning", title: "გაწმენდა ზედმეტი რისკის გარეშე", paragraphs: ["გარე წმენდამდე მოწყობილობა სრულად გამორთეთ და კვებიდან გამოაერთეთ. მიჰყევით მწარმოებლის ინსტრუქციას; საწმენდი სითხე ღიობებში არ შეასხათ. შიდა დაშლა, თერმული მასალის შეცვლა და კვების ნაწილის გაწმენდა გამოცდილებას საჭიროებს. სხვადასხვა კონსოლის დაშლის ვიდეოები ერთმანეთის შემცვლელი არ არის."] },
        { id: "service", title: "როდის სჯობს დიაგნოსტიკა", paragraphs: ["თუ სივრცის მოწესრიგების შემდეგ გაფრთხილება ან გამორთვა მეორდება, თამაშით ხელახლა დატვირთვას მოერიდეთ. მიზეზი შეიძლება გაგრილებასთან ერთად კვების ან სხვა კომპონენტის პრობლემაც იყოს. მოამზადეთ კონსოლის მოდელი, შეცდომის ფოტო და ინფორმაცია წინა წმენდის შესახებ. თუ მოწყობილობა სტაბილურად მუშაობს, მნიშვნელოვანი შენახული პროგრესის ასლი წინასწარ გადაამოწმეთ."] },
      ],
      sources: [{ label: "PlayStation — PS5-ის ხმაური და ვენტილაცია", url: "https://www.playstation.com/en-gb/support/hardware/ps5-console-noise/" }],
    },
    en: {
      title: "Console overheating: signs and prevention",
      excerpt: "Learn the difference between normal fan noise and warning signs, and give your console room to cool.",
      imageAlt: "Technical maintenance of a games console",
      takeaway: "A louder fan is not proof of a fault. Repeated shutdowns or temperature warnings deserve an assessment.",
      sections: [
        { id: "symptoms", title: "Noise alone is not overheating", paragraphs: ["A demanding game may make the fan run faster. More useful warning signs include a temperature message, repeated shutdowns or a new problem in a previously stable game. Note the exact message and how long the console had been running. One symptom is not enough to identify a faulty part."] },
        { id: "airflow", title: "Leave room for airflow", paragraphs: ["Avoid enclosed cabinets and placing the console on another warm device. Use the stand and orientation specified for your model. Sony specifies at least 10 cm of clearance for PS5; check the instructions for other consoles rather than assuming the same measurement applies."], bullets: ["Keep fabric and decorations away from ventilation openings.", "Choose a firm surface rather than thick carpet.", "Avoid direct sunlight and tightly packed shelves."] },
        { id: "cleaning", title: "Clean without adding risk", paragraphs: ["Before exterior cleaning, shut the console down completely and disconnect power. Follow its manufacturer's cleaning instructions and never spray liquid into openings. Internal disassembly, thermal-material replacement and power-supply work require appropriate experience. A tutorial for a different console is not a substitute for your model's instructions."] },
        { id: "service", title: "When to arrange diagnosis", paragraphs: ["If shutdowns or warnings continue after improving ventilation, avoid repeatedly stressing the console. Cooling is only one possible cause. Provide the model, an error photo and any maintenance history. When the console is stable, check that important saved-game data has a separate backup before service."] },
      ],
      sources: [{ label: "PlayStation: PS5 noise and ventilation guidance", url: "https://www.playstation.com/en-gb/support/hardware/ps5-console-noise/" }],
    },
  },
  "choose-right-ssd": {
    categoryId: "components", readMinutes: 3, serviceHref: "/services/laptop-repair/",
    ka: {
      takeaway: "SSD შეარჩიეთ ლეპტოპის ზუსტი მოდელით, ინტერფეისითა და ზომით. მხოლოდ „M.2“ წარწერა თავსებადობას არ ადასტურებს.",
      sections: [
        { id: "compatibility", title: "ჯერ მოდელი, შემდეგ დისკი", paragraphs: ["ერთი სერიის ლეპტოპებსაც შეიძლება განსხვავებული შიდა კონფიგურაცია ჰქონდეთ. მოძებნეთ ზუსტი მოდელის კოდი და მწარმოებლის ტექნიკური სახელმძღვანელო. გადაამოწმეთ, საცავი საერთოდ იცვლება თუ არა, რომელი ბუდეა ხელმისაწვდომი და დამატებითი სამაგრი ან კაბელი ხომ არ სჭირდება. ყიდვამდე ეს ინფორმაცია უფრო მნიშვნელოვანია, ვიდრე შეფუთვაზე დიდი სიჩქარის რიცხვი."] },
        { id: "interfaces", title: "M.2, SATA და NVMe", paragraphs: ["M.2 დისკის ფიზიკურ ფორმატს აღნიშნავს და არა კავშირის სიჩქარეს. M.2 დისკი შეიძლება SATA ან NVMe ტექნოლოგიას იყენებდეს. ორი მსგავსი დისკი შეიძლება ერთსა და იმავე ბუდეს არ ერგებოდეს. სიგრძეც გასათვალისწინებელია: მაგალითად, 2280 ყველა პატარა ლეპტოპში არ თავსდება."], bullets: ["გადაამოწმეთ მხარდაჭერილი ინტერფეისი და ფიზიკური ზომა.", "შეამოწმეთ სისქე, სამაგრი და გაგრილებისთვის დარჩენილი სივრცე.", "თავსებადობა მხოლოდ ფოტოთი ან კონექტორის მსგავსებით არ გადაწყვიტოთ."] },
        { id: "capacity", title: "მოცულობა თქვენი სამუშაოს მიხედვით", paragraphs: ["დათვალეთ სისტემის, პროგრამებისა და სამუშაო ფაილების ახლანდელი მოცულობა და დატოვეთ ადგილი ზრდისთვის. დოკუმენტებზე მუშაობას და დიდი ვიდეოარქივის შენახვას განსხვავებული მოთხოვნები აქვს. მხოლოდ მაქსიმალურ სიჩქარეზე ნუ იქნებით ორიენტირებული: ლეპტოპის შესაძლებლობებმა უფრო ძვირი დისკის უპირატესობა შეიძლება შეზღუდოს. მნიშვნელოვანი ფაილების სარეზერვო ასლი ახალ დისკზეც აუცილებელია."] },
        { id: "migration", title: "გადატანა წინასწარ დაგეგმეთ", paragraphs: ["გარკვიეთ, ძველი სისტემის გადატანა გინდათ თუ სუფთა ინსტალაცია. საჭირო ანგარიშებზე წვდომის მონაცემები და დაშიფვრის აღდგენის გასაღები უსაფრთხო ადგილას შეინახეთ. ძველი დისკი არ წაშალოთ, სანამ ახალი სისტემის ჩატვირთვასა და ფაილებს არ შეამოწმებთ. თუ ძველი მატარებელი შეცდომებს აჩვენებს, ჩვეულებრივი კლონირების ნაცვლად ჯერ მონაცემების დაცვის გზაზე შეთანხმდით."] },
      ],
      sources: [{ label: "Kingston — M.2, SATA და NVMe-ის განსხვავება", url: "https://www.kingston.com/en/blog/pc-performance/two-types-m2-vs-ssd" }, { label: "Crucial — NVMe M.2-ის ინსტალაციის გზამკვლევი", url: "https://www.crucial.com/content/dam/crucial/ssd-products/ssd-family/documents/installation-guides/nvme-pcie-m-2-install/crucial-nvme-pcie-m2-ssd-install-guide.pdf" }],
    },
    en: {
      title: "How to choose the right SSD for your laptop",
      excerpt: "Check the interface, physical size and laptop specification before comparing capacity and speed.",
      imageAlt: "Choosing an SSD for a laptop",
      takeaway: "Match the SSD to your exact laptop model, interface and dimensions. An M.2 label alone does not confirm compatibility.",
      sections: [
        { id: "compatibility", title: "Start with the exact laptop model", paragraphs: ["Even laptops in the same product family can have different internal configurations. Find the full model code and its technical manual. Confirm whether storage is replaceable, which slot is available and whether a bracket or cable is needed. These details matter more than an impressive advertised speed."] },
        { id: "interfaces", title: "Understand M.2, SATA and NVMe", paragraphs: ["M.2 describes a physical format, not a guarantee of NVMe support. Similar-looking drives can use different interfaces. Length also matters: a 2280 drive will not fit every compact laptop."], bullets: ["Check the supported interface and physical dimensions.", "Allow for the mounting point, thickness and cooling clearance.", "Do not decide compatibility from a photograph or connector shape alone."] },
        { id: "capacity", title: "Choose capacity for your workload", paragraphs: ["Add up your operating system, applications and current files, then allow room to grow. Office documents and a large video archive have different storage requirements. A laptop may also limit the benefit of a more expensive drive. New storage still needs a separate backup of important files."] },
        { id: "migration", title: "Plan the migration", paragraphs: ["Decide whether to transfer the existing system or start with a clean installation. Keep account access and encryption recovery keys somewhere safe. Do not erase the old drive until the replacement boots and its files have been checked. If the original drive reports errors, agree a data-protection approach before attempting routine cloning."] },
      ],
      sources: [{ label: "Kingston: M.2 SATA and NVMe explained", url: "https://www.kingston.com/en/blog/pc-performance/two-types-m2-vs-ssd" }, { label: "Crucial: NVMe M.2 installation guide", url: "https://www.crucial.com/content/dam/crucial/ssd-products/ssd-family/documents/installation-guides/nvme-pcie-m-2-install/crucial-nvme-pcie-m2-ssd-install-guide.pdf" }],
    },
  },
  "drone-care": {
    categoryId: "drones", readMinutes: 3, serviceHref: "/services/drone-repair/",
    ka: {
      takeaway: "დაზიანებული პროპელერი, გაბერილი ბატარეა ან აუხსნელი შეცდომა ფრენის გადადების მიზეზია. კონკრეტული მოდელის ინსტრუქცია ყოველთვის პრიორიტეტულია.",
      sections: [
        { id: "inspection", title: "დათვალიერება აფრენამდე", paragraphs: ["შეამოწმეთ დრონის კორპუსი, გაშლილი მკლავები და პროპელერები. ბზარი, დეფორმაცია ან ცუდად დაფიქსირებული ნაწილი მხოლოდ ვიზუალური ნაკლი არ არის. კამერის დამცავი მოხსენით მოდელის ინსტრუქციის მიხედვით და დარწმუნდით, რომ საკიდს არაფერი ზღუდავს. ძრავებთან ქვიშა ან სხვა უცხო ნაწილაკი საყურადღებოა; წინააღმდეგობის დასაძლევად ძალა არ გამოიყენოთ."], bullets: ["ბატარეა სწორად უნდა იყოს ჩასმული და დაფიქსირებული.", "პროპელერის ტიპი და დამაგრება კონკრეტულ ძრავას უნდა შეესაბამებოდეს."] },
        { id: "battery", title: "ბატარეის მდგომარეობა", paragraphs: ["შეამოწმეთ მუხტი, კორპუსი და კონტაქტები. გაბერილი, დაზიანებული ან უჩვეულოდ ცხელი ბატარეით არ იფრინოთ და არ დამუხტოთ ის. ფრენის შემდეგ დატენვამდე აცადეთ გაგრილება მწარმოებლის მითითების შესაბამისად. შენახვის მუხტი და ტემპერატურა მოდელის მიხედვით განსხვავდება, ამიტომ უნივერსალურ პროცენტს ნუ დაეყრდნობით."] },
        { id: "settings", title: "შეტყობინებები და გარემო", paragraphs: ["გადაამოწმეთ აპლიკაციის გაფრთხილებები, კავშირის მდგომარეობა და დაბრუნების პარამეტრები. დაბრუნების სიმაღლე გარემოში არსებულ დაბრკოლებებს უნდა შეესაბამებოდეს. მოერიდეთ საცდელ აფრენას, თუ კომპასის, სენსორის ან ძრავის აუხსნელი შეცდომა რჩება. დაცემის შემდეგ მხოლოდ გარეგნული სიმრთელე უსაფრთხო ფრენის დასტური არ არის."] },
        { id: "after-flight", title: "დაფრენის შემდეგ", paragraphs: ["გამორთეთ მოწყობილობა და შეამოწმეთ ახალი დაზიანება ან ტენი. გარეთა ნაწილები ინსტრუქციის მიხედვით გაასუფთავეთ, ძრავებში სითხე არ ჩაასხათ. პრობლემის შემთხვევაში შეინახეთ შეცდომის ფოტო, ფრენის ჩანაწერი და შემთხვევის მოკლე აღწერა. სერვისს უთხარით მოდელი და გამოყენებული ბატარეა. შეკეთების შემდეგაც პირველი შემოწმება კონტროლირებულ, უსაფრთხო პირობებში უნდა დაიგეგმოს."] },
      ],
      sources: [{ label: "DJI — უსაფრთხოება და ფრენამდე შემოწმება (Matrice 30)", url: "https://dl.djicdn.com/downloads/matrice-30-series/Matrice30_Series_DISCLAIMER_AND_SAFETY_GUIDELINES.pdf" }, { label: "DJI — ბატარეის მოვლის გზამკვლევი", url: "https://repair.dji.com/help/content?customId=en-us03400006549&lang=en&re=ID&spaceId=34" }],
    },
    en: {
      title: "Drone care before and after a flight",
      excerpt: "A practical check of propellers, batteries, camera movement and warning messages before take-off.",
      imageAlt: "Drone inspection and technical maintenance",
      takeaway: "A damaged propeller, swollen battery or unexplained warning is a reason to postpone a flight. Follow your specific model's manual.",
      sections: [
        { id: "inspection", title: "Inspect before take-off", paragraphs: ["Check the body, unfolded arms and propellers. Cracks, deformation and loose parts are not merely cosmetic. Remove the camera protector as instructed and ensure nothing obstructs the gimbal. Look for sand or debris near motors; do not force a part that resists movement."], bullets: ["Confirm the battery is correctly seated and secured.", "Match each propeller and its mounting method to the correct motor."] },
        { id: "battery", title: "Check the battery", paragraphs: ["Inspect its charge, casing and contacts. Do not fly with or charge a swollen, damaged or unusually hot battery. Let it cool after use in line with the manufacturer's guidance. Storage charge and temperature requirements differ between models, so do not rely on a universal percentage."] },
        { id: "settings", title: "Review warnings and surroundings", paragraphs: ["Check app warnings, connection status and return-to-home settings. Return height must account for surrounding obstacles. Do not attempt a test flight while an unexplained compass, sensor or motor warning remains. After a crash, an intact exterior alone does not establish that the aircraft is safe."] },
        { id: "after-flight", title: "After landing", paragraphs: ["Power down and inspect for new damage or moisture. Follow the manual for external cleaning; never pour liquid into motors. If a problem occurs, preserve the warning photo, flight record and a short account of the incident. Tell the service team the model and battery used. Plan post-repair checks in controlled, safe conditions."] },
      ],
      sources: [{ label: "DJI: Safety and pre-flight guidance (Matrice 30)", url: "https://dl.djicdn.com/downloads/matrice-30-series/Matrice30_Series_DISCLAIMER_AND_SAFETY_GUIDELINES.pdf" }, { label: "DJI: Battery routine maintenance guide", url: "https://repair.dji.com/help/content?customId=en-us03400006549&lang=en&re=ID&spaceId=34" }],
    },
  },
  "computer-shuts-down-under-load": {
    categoryId: "computers", readMinutes: 3, serviceHref: "/services/computer-repair/",
    ka: {
      takeaway: "მოულოდნელი გამორთვა მხოლოდ კვების ბლოკის ბრალი არ არის. განმეორებულმა დატვირთვამ მიზეზის დადგენამდე დამატებითი რისკი შეიძლება შექმნას.",
      sections: [
        { id: "describe", title: "გათიშვა, გადატვირთვა თუ გამოსახულების დაკარგვა?", paragraphs: ["სერვისისთვის მნიშვნელოვანია განსხვავება: კომპიუტერი მთლიანად ითიშება, თავიდან იტვირთება თუ მხოლოდ მონიტორზე ქრება გამოსახულება. დააკვირდით, რჩება თუ არა ხმა ან ვენტილატორის მუშაობა. ჩაიწერეთ კონკრეტული თამაში ან პროგრამა და დრო, რომლის შემდეგაც პრობლემა ჩნდება. ეს დეტალები თავიდან აგვარიდებს შემთხვევით შერჩეული ნაწილის შეცვლას."] },
        { id: "causes", title: "რას ამოწმებს დიაგნოსტიკა", paragraphs: ["დატვირთვისას მეტი სითბო გამოიყოფა და კვების მოთხოვნაც იცვლება. გაგრილება და კვების სტაბილურობა ამიტომ მნიშვნელოვანი მიმართულებებია, თუმცა მიზეზი შეიძლება მეხსიერება, ვიდეოკარტა, კონტაქტი ან პროგრამული შეცდომაც იყოს. ერთი სიმპტომით საბოლოო დასკვნას ვერ მივიღებთ."], bullets: ["ბოლო დროს დამატებული კომპონენტი და მისი ზუსტი მოდელი.", "გამორთვამდე ნაჩვენები შეცდომა ან სისტემის შეტყობინება.", "პრობლემის კავშირი კონკრეტულ დატვირთვასთან ან გარემოსთან."] },
        { id: "safe-actions", title: "უსაფრთხო საწყისი მოქმედებები", paragraphs: ["გამორთულ კომპიუტერზე გარედან შეამოწმეთ, ხომ არ არის ჰაერის ღიობები დაფარული. დაზიანებული კვების კაბელი ან დამწვრის სუნი გამოყენების შეწყვეტის მიზეზია. კვების ბლოკის კორპუსი არ გახსნათ — შიდა კომპონენტები გამორთვის შემდეგაც შეიძლება საშიში იყოს. ასევე ნუ შეცვლით ძაბვის პარამეტრებს და ნუ გაუშვებთ განმეორებით მძიმე ტესტებს პრობლემის გამოსაწვევად."] },
        { id: "prepare", title: "მოამზადეთ კომპიუტერი სერვისისთვის", paragraphs: ["თუ სისტემა სტაბილურად მუშაობს მსუბუქ რეჟიმში და საფრთხის ნიშნები არ აქვს, მნიშვნელოვანი ფაილების ასლი შეინახეთ. შეადგინეთ კომპონენტების სია და მიუთითეთ, როდის დაიწყო გათიშვა. ტემპერატურის ერთი რიცხვი ყველა პროცესორისთვის ერთნაირად არ ფასდება; შეფასებას ზუსტი მოდელი სჭირდება. შეკეთების შემდეგ შედეგი იმავე ტიპის სამუშაოზე კონტროლირებულად უნდა გადამოწმდეს."] },
      ],
      sources: [{ label: "Dell — გადახურება, შეფერხება და გამორთვა", url: "https://www.dell.com/support/kbdoc/en-us/000130867/how-to-troubleshoot-a-overheating-shutdown-or-thermal-issue-on-a-dell-pc" }],
    },
    en: {
      title: "Why does a computer shut down under load?",
      excerpt: "Power, cooling and other faults can look similar. Document the symptom before replacing components.",
      imageAlt: "Diagnosis of computer components",
      takeaway: "An unexpected shutdown does not automatically mean a failed power supply. Repeated stress testing can add risk before the cause is known.",
      sections: [
        { id: "describe", title: "Shutdown, restart or a blank screen?", paragraphs: ["Does the whole computer switch off, restart or simply stop displaying an image? Note whether sound or fans continue. Record the game or application and the time before the failure. Those details help avoid replacing an unrelated component based on a vague description of the problem."] },
        { id: "causes", title: "What diagnosis should cover", paragraphs: ["Heavy workloads increase heat and change power demand, making cooling and power stability relevant checks. Memory, graphics hardware, connections or software can also be involved. One symptom does not establish the cause."], bullets: ["List recently installed components and their exact models.", "Keep any error message shown before the shutdown.", "Note whether the failure follows a particular workload or environment."] },
        { id: "safe-actions", title: "Take safe first steps", paragraphs: ["With the computer off, check externally for covered air openings. Stop using a damaged power cable or equipment that smells burnt. Never open the power-supply enclosure: internal components can remain hazardous after disconnection. Avoid changing voltage settings or repeatedly running demanding tests just to reproduce the fault."] },
        { id: "prepare", title: "Prepare for service", paragraphs: ["If the system remains stable during light work and has no danger signs, protect important files with a backup. Bring the component list and a timeline of the issue. A temperature reading needs interpretation for the specific component; there is no single limit for every processor. After repair, the original workload should be checked under controlled conditions."] },
      ],
      sources: [{ label: "Dell: Overheating, performance and shutdown issues", url: "https://www.dell.com/support/kbdoc/en-us/000130867/how-to-troubleshoot-a-overheating-shutdown-or-thermal-issue-on-a-dell-pc" }],
    },
  },
  "data-recovery-after-formatting": {
    categoryId: "data", readMinutes: 3, serviceHref: "/services/data-recovery/",
    ka: {
      takeaway: "ფორმატირებული დისკი აღარ გამოიყენოთ ახალი ფაილებისთვის. აღდგენა ზოგ შემთხვევაში შესაძლებელია, მაგრამ გარანტირებული არ არის.",
      sections: [
        { id: "what-happened", title: "ზუსტად რა მოქმედება შესრულდა?", paragraphs: ["ფორმატირების შემდეგ ცარიელი საქაღალდე არ გვიჩვენებს, რა დარჩა უშუალოდ მატარებელზე. შედეგზე მოქმედებს დისკის ტიპი, ფორმატირების მეთოდი, შემდგომი გამოყენება და დაშიფვრა. ჩაიწერეთ, რომელი პროგრამით იმუშავეთ და ხომ არ დააყენეთ შემდეგ ახალი სისტემა. თუ მხოლოდ ფორმატირების მოთხოვნას ხედავთ, დათანხმება მონაცემების შენარჩუნების გზა არ არის."] },
        { id: "stop-writes", title: "შეინარჩუნეთ არსებული მდგომარეობა", paragraphs: ["არ გაიმეოროთ ფორმატირება და არ შექმნათ ახალი დანაყოფები. ასევე არ გადაიტანოთ უკან სარეზერვო ასლი იმავე დისკზე, სანამ დაკარგული ფაილების საკითხს არ გადაწყვეტთ. ამ მოქმედებებმა შეიძლება დარჩენილი ინფორმაცია შეცვალოს. აღდგენის პროგრამის მიერ ნაპოვნი ფაილებიც სხვა მატარებელზე უნდა შეინახოთ."], bullets: ["არ დააყენოთ ახალი სისტემა ან პროგრამები დაზიანებულ წყაროზე.", "მნიშვნელოვანი ერთადერთი ასლის შემთხვევაში ჯერ შეფასება მოითხოვეთ."] },
        { id: "limits", title: "რატომ განსხვავდება შედეგი", paragraphs: ["HDD-ისა და SSD-ის ერთი და იგივე პროცედურა განსხვავებულ შედეგს იძლევა. SSD-ზე TRIM-მა და შიდა დამუშავებამ წაშლილი მონაცემები შეიძლება მიუწვდომელი გახადოს. ახალი ჩაწერით გადაფარული ინფორმაცია ასევე სერიოზულ შეზღუდვას ქმნის. ნაპოვნი ფაილის სახელი ან წინასწარი სია ჯერ არ ადასტურებს, რომ მისი შიგთავსი გამართულად აღდგება."] },
        { id: "assessment", title: "რა მოამზადოთ შესაფასებლად", paragraphs: ["მიუთითეთ დისკის მოდელი, მოცულობა, ფაილების ტიპები და ყველაზე მნიშვნელოვანი საქაღალდეები. გააცანით სპეციალისტს უკვე გამოყენებული პროგრამები და შედეგები. შეფასებისას უნდა გაიმიჯნოს წაკითხვადი ფაილები, დაზიანებული მასალა და ის, რაც ვერ მოიძებნა. შემდგომი ასლები ცალკე მოწყობილობაზე შეინახეთ და შემთხვევით შერჩეული რამდენიმე ფაილის ნაცვლად მნიშვნელოვანი მასალა ყურადღებით გადაამოწმეთ."] },
      ],
      sources: [{ label: "Seagate — ფორმატირების მოთხოვნა და მონაცემების დაცვა", url: "https://www.seagate.com/support/kb/usb-external-troubleshooter-003581en/" }, { label: "Microsoft — ფაილების აღდგენის შეზღუდვები", url: "https://support.microsoft.com/en-us/windows/experience/backup-recovery/windows-file-recovery" }, { label: "Kingston — SSD-ზე TRIM-ის მუშაობა", url: "https://www.kingston.com/en/blog/servers-and-data-centers/garbage-collection" }],
    },
    en: {
      title: "Data recovery after formatting a drive",
      excerpt: "What affects recovery, why further writes matter and what information to prepare for an assessment.",
      imageAlt: "Safe recovery of files from a storage drive",
      takeaway: "Do not reuse a formatted drive for new files. Recovery is possible in some cases, but it is never guaranteed.",
      sections: [
        { id: "what-happened", title: "Identify what actually happened", paragraphs: ["An empty folder after formatting does not reveal what remains on the storage device. Drive type, formatting method, subsequent use and encryption all matter. Record the application used and whether a new operating system was installed. If the system merely asks you to format a drive, accepting is not a way to preserve its files."] },
        { id: "stop-writes", title: "Preserve the current state", paragraphs: ["Do not format again, create new partitions or restore a backup onto the affected drive while missing files remain unresolved. These actions can change remaining data. Files found by recovery software must also be saved elsewhere."], bullets: ["Do not install a system or applications on the affected source.", "Get an assessment first when it holds the only important copy."] },
        { id: "limits", title: "Understand the limitations", paragraphs: ["HDDs and SSDs can behave differently after the same action. On an SSD, TRIM and internal processing may make deleted content inaccessible. Overwriting adds another serious limitation. A recovered filename or preview list does not establish that the complete file contents will be usable."] },
        { id: "assessment", title: "Prepare for an assessment", paragraphs: ["Provide the drive model, capacity, file types and priority folders. Describe software already tried and its results. The assessment should distinguish readable files from damaged or missing material. Keep recovered copies on separate storage, then check important content carefully rather than assuming success because a few sample files open."] },
      ],
      sources: [{ label: "Seagate: External-drive troubleshooting and formatting cautions", url: "https://www.seagate.com/support/kb/usb-external-troubleshooter-003581en/" }, { label: "Microsoft: Windows File Recovery limitations", url: "https://support.microsoft.com/en-us/windows/experience/backup-recovery/windows-file-recovery" }, { label: "Kingston: How SSD garbage collection and TRIM work", url: "https://www.kingston.com/en/blog/servers-and-data-centers/garbage-collection" }],
    },
  },
  "xbox-controller-problems": {
    categoryId: "consoles", readMinutes: 3, serviceHref: "/services/console-repair/",
    ka: {
      takeaway: "კავშირის დაკარგვა და სტიკის თვითნებური მოძრაობა სხვადასხვა პრობლემაა. დაიწყეთ მარტივი შემოწმებით, მუდმივი გაუმართაობა კი დიაგნოსტიკას საჭიროებს.",
      sections: [
        { id: "separate", title: "სიმპტომები ერთმანეთისგან გამოყავით", paragraphs: ["თუ პერსონაჟი ხელის შეხების გარეშე მოძრაობს, საქმე შესაძლოა სტიკის არასასურველ სიგნალთან გვქონდეს. თუ კონტროლერი კავშირს მთლიანად კარგავს, პირველ რიგში კვება და კავშირია გასარკვევი. შეამოწმეთ, პრობლემა ერთ თამაშში ჩანს თუ მენიუშიც. სხვადასხვა თამაშის მგრძნობელობის პარამეტრებმა შეიძლება ერთი და იგივე კონტროლერი განსხვავებულად წარმოაჩინოს."] },
        { id: "connection", title: "კვება და კავშირის ტიპი", paragraphs: ["შეამოწმეთ ელემენტები ან თქვენი მოდელისთვის განკუთვნილი ბატარეა. თავსებადი USB მონაცემთა კაბელით შეადარეთ სადენიანი და უსადენო მუშაობა; მხოლოდ დამტენი კაბელი სრულფასოვანი ტესტისთვის არ გამოდგება. თუ შესაძლებელია, სცადეთ სხვა გამართულ მოწყობილობაზე. მიაქციეთ ყურადღება, მოძრაობისას კაბელთან ან პორტთან ხომ არ წყდება კავშირი."], bullets: ["მოინიშნეთ, პრობლემა Bluetooth-ით, კონსოლის კავშირით თუ კაბელით ჩნდება.", "შეამოწმეთ, სხვა კონტროლერს იმავე მოწყობილობაზე მსგავსი პრობლემა ხომ არ აქვს."] },
        { id: "software", title: "პროგრამული შემოწმების საზღვრები", paragraphs: ["ოფიციალური Xbox Accessories აპლიკაცია მხარდაჭერილი მოდელის განახლებისა და შემოწმებისთვის გამოიყენეთ. თუ შესაბამისი კალიბრაციის ფუნქცია ხელმისაწვდომია, მიჰყევით მის ინსტრუქციას. კალიბრაცია ცვეთით გამოწვეულ ყველა პრობლემას ვერ აგვარებს. თამაშში ე.წ. მკვდარი ზონის გაზრდამ სიმპტომი შეიძლება შეამციროს, მაგრამ დაზიანებული მექანიზმის შეკეთებას არ ნიშნავს."] },
        { id: "repair", title: "როდის არის საჭირო შეკეთება", paragraphs: ["ჩავარდნილი ღილაკი, დაზიანებული პორტი ან მუდმივი გადახრა ფიზიკურ შემოწმებას საჭიროებს. ღილაკებში საწმენდი სითხე არ ჩაასხათ და შეკეთების მიზნით მექანიზმს ძალა არ დაატანოთ. სერვისს მიაწოდეთ კონტროლერის ზუსტი მოდელი, სიმპტომის მოკლე ვიდეო და ჩატარებული შემოწმებები. ასე უფრო ადვილად გაიმიჯნება კავშირის, პროგრამისა და კომპონენტის პრობლემა."] },
      ],
      sources: [{ label: "Xbox — კონტროლერის კალიბრაციის შესაძლებლობები და შეზღუდვები", url: "https://news.xbox.com/en-us/2024/02/14/xbox-february-update-rolls-out-2024/" }, { label: "Xbox — კონტროლერის ოფიციალური მხარდაჭერა", url: "https://support.xbox.com/en-US/help/hardware-network/controller/wireless-controller-solution" }],
    },
    en: {
      title: "Common Xbox controller problems",
      excerpt: "Separate stick drift from connection failures and find out which basic checks are useful before repair.",
      imageAlt: "Xbox controller repair and diagnosis",
      takeaway: "Unwanted stick input and a lost connection are different faults. Start with simple checks; persistent problems need diagnosis.",
      sections: [
        { id: "separate", title: "Separate the symptoms", paragraphs: ["Movement without touching a stick suggests unwanted input. A controller that disconnects entirely calls for checking power and connectivity first. Does it happen in one game or also in menus? Different sensitivity settings can make the same controller behave differently, so record where the issue appears."] },
        { id: "connection", title: "Check power and connection type", paragraphs: ["Check the batteries or compatible battery pack. Compare wired and wireless operation with a suitable USB data cable; a charge-only cable is not an adequate test. If available, try another working device. Note whether moving the cable causes a connection to drop."], bullets: ["Record whether it happens over Bluetooth, the console connection or USB.", "Check whether another controller has the same issue on that device."] },
        { id: "software", title: "Know the limits of software checks", paragraphs: ["Use the official Xbox Accessories application for supported updates and checks. Follow its instructions if a calibration option is available for your controller. Recalibration cannot resolve every issue caused by wear. Increasing a game's dead zone may mask a symptom; it does not repair a damaged mechanism."] },
        { id: "repair", title: "When repair is appropriate", paragraphs: ["A stuck button, damaged port or persistent drift needs physical assessment. Do not pour cleaning liquid into buttons or force a mechanism. Provide the exact controller model, a short symptom video and the checks already performed. This helps distinguish connection, software and component problems without guessing which part needs replacement."] },
      ],
      sources: [{ label: "Xbox: Controller recalibration and its limitations", url: "https://news.xbox.com/en-us/2024/02/14/xbox-february-update-rolls-out-2024/" }, { label: "Xbox: Official wireless controller support", url: "https://support.xbox.com/en-US/help/hardware-network/controller/wireless-controller-solution" }],
    },
  },
  "laptop-battery-replacement-signs": {
    categoryId: "laptops", readMinutes: 3, serviceHref: "/services/laptop-repair/",
    ka: {
      takeaway: "გაბერილი ან დაზიანებული ბატარეით ლეპტოპის გამოყენება და დატენვა შეწყვიტეთ. სწრაფი დაცლა კი ჯერ მიზეზის დადგენას საჭიროებს.",
      sections: [
        { id: "runtime", title: "სწრაფი დაცლა ყოველთვის ბატარეის ბრალი არ არის", paragraphs: ["დროის განმავლობაში ბატარეის ტევადობა მცირდება, მაგრამ მუშაობის ხანგრძლივობაზე პროგრამები, ეკრანის სიკაშკაშე და დატვირთვაც მოქმედებს. შეადარეთ მსგავსი სამუშაო პირობები. მხოლოდ ერთი მძიმე თამაშის შემდეგ მიღებული შედეგით შეცვლის აუცილებლობას ვერ შევაფასებთ. სასარგებლოა იმის აღნიშვნაც, უცებ გაუარესდა მდგომარეობა თუ ცვლილება თანდათან მოხდა."] },
        { id: "warning", title: "დეფორმაცია უყურადღებოდ არ დატოვოთ", paragraphs: ["კორპუსის ნაწილების დაშორება, აწეული თაჩპადი ან ბატარეის შესამჩნევი გაბერვა გამოყენების შეწყვეტის მიზეზია. გამორთეთ მოწყობილობა და შეწყვიტეთ დატენვა. არ დააწვეთ გაბერილ ნაწილს, არ გახვრიტოთ და ძალით არ სცადოთ ჩარჩენილი ბატარეის ამოღება. თუ კორპუსი დაზიანებულია, შიდა ნაწილებს ნუ შეეხებით — უსაფრთხო მოქმედების შესახებ სპეციალისტს მიმართეთ."] },
        { id: "diagnosis", title: "რა ინფორმაცია ეხმარება დიაგნოსტიკას", paragraphs: ["ტევადობის შეფასება, დამტენის მდგომარეობა და კვების კვანძის შემოწმება ერთმანეთისგან უნდა გაიმიჯნოს. თუ ლეპტოპი საერთოდ არ იტენება, მიზეზი შეიძლება დამტენი, პორტი ან პლატაც იყოს."], bullets: ["მიუთითეთ ლეპტოპისა და დამტენის ზუსტი მოდელი.", "ჩაიწერეთ, რა პროცენტზე ითიშება და ჩანს თუ არა შეცდომა.", "მოიტანეთ დამტენიც, თუ პრობლემა მასთან მუშაობისას ჩნდება."] },
        { id: "replacement", title: "შეცვლა და შემდგომი მოვლა", paragraphs: ["ახალი ბატარეა ზუსტ მოდელსა და მწარმოებლის მოთხოვნებს უნდა შეესაბამებოდეს. მხოლოდ ზომით ან კონექტორით არჩევა საკმარისი არ არის. ძველი ბატარეის უსაფრთხო ჩაბარების გზა სერვისთან შეათანხმეთ; ჩვეულებრივ ნაგავში ნუ გადააგდებთ. შეცვლის შემდეგ გადაამოწმეთ დატენვა და მუშაობა ჩვეულ დატვირთვაზე. თავსებადი დამტენი და გადახურების თავიდან აცილება ახალი ბატარეისთვისაც მნიშვნელოვანია."] },
      ],
      sources: [{ label: "Dell — გაბერილ ლითიუმ-იონურ ბატარეასთან მოპყრობა", url: "https://dl.dell.com/manuals/common/Swollen_Battery_TechSheet.PDF" }, { label: "HP — ბატარეის გაბერვის შემთხვევაში მოქმედება", url: "https://support.hp.com/ee-en/document/ish_4158581-4158704-16" }],
    },
    en: {
      title: "Signs that a laptop battery needs attention",
      excerpt: "Distinguish reduced runtime from swelling, charging faults and other signs that need assessment.",
      imageAlt: "Diagnosis of a laptop battery",
      takeaway: "Stop using and charging a laptop with a swollen or damaged battery. Short runtime alone needs further investigation.",
      sections: [
        { id: "runtime", title: "Short runtime is not the whole diagnosis", paragraphs: ["Battery capacity decreases with use, but applications, display brightness and workload also affect runtime. Compare similar working conditions rather than judging a battery after one demanding game. Record whether the change was gradual or sudden and whether a recent software or workload change coincided with it."] },
        { id: "warning", title: "Do not ignore deformation", paragraphs: ["A separating case, raised touchpad or visibly swollen battery is a reason to stop using the device. Shut it down and stop charging. Do not press, puncture or force out a stuck battery. If the enclosure is damaged, obtain safe service guidance instead of handling exposed internal parts."] },
        { id: "diagnosis", title: "Prepare useful information", paragraphs: ["Battery health, the charger and charging circuitry need separate checks. A laptop that will not charge may have an adapter, port or board problem rather than simply an exhausted battery."], bullets: ["Provide the exact laptop and charger models.", "Note the reported charge level at shutdown and any error message.", "Bring the charger if the problem occurs while it is connected."] },
        { id: "replacement", title: "Replacement and subsequent care", paragraphs: ["A replacement must meet the requirements for the exact laptop model; matching size or connector shape is not enough. Ask about a suitable battery collection or recycling route rather than putting the old pack in ordinary waste. After replacement, check charging and normal-workload operation. A compatible charger and protection from excessive heat remain important."] },
      ],
      sources: [{ label: "Dell: Handling swollen lithium-ion batteries", url: "https://dl.dell.com/manuals/common/Swollen_Battery_TechSheet.PDF" }, { label: "HP: What to do about battery swelling", url: "https://support.hp.com/ee-en/document/ish_4158581-4158704-16" }],
    },
  },
  "raid-first-steps": {
    categoryId: "data", readMinutes: 3, serviceHref: "/services/data-recovery/",
    ka: {
      takeaway: "RAID-ის გაფრთხილებისას შეინარჩუნეთ დისკების თანმიმდევრობა და კონფიგურაცია. დაუზუსტებელი ხელახალი აწყობა ან ინიციალიზაცია მონაცემებს დამატებით რისკს უქმნის.",
      sections: [
        { id: "state", title: "გაარკვიეთ მდგომარეობა ცვლილებების გარეშე", paragraphs: ["„Degraded“ და „Crashed“ ერთი და იგივე მდგომარეობა არ არის. პირველ შემთხვევაში მასივი ზოგჯერ მუშაობას აგრძელებს, თუმცა დაცვა შემცირებულია; მეორე შემთხვევაში მონაცემებზე წვდომაც შეიძლება დაკარგული იყოს. გადაიღეთ სტატუსის, დისკების ნომრებისა და შეცდომების ეკრანი. შეტყობინება ნაწილების ამოღებით ან ახალი მასივის შექმნით არ გააქროთ."] },
        { id: "preserve", title: "შეინარჩუნეთ დისკების რიგი", paragraphs: ["დამატებითი ჩაწერა შეზღუდეთ და შეინახეთ კონფიგურაციის არსებული ინფორმაცია. დისკები თვითნებურად არ გადაანაცვლოთ. თუ მოწყობილობის გამორთვა ან დისკის ამოღება გახდა საჭირო, ჯერ ზუსტი მოდელის პროცედურა გაარკვიეთ. ყველა მასივისთვის ერთნაირი მითითება — „მაშინვე გამორთეთ“ ან „მაშინვე აღადგინეთ“ — უსაფრთხო არ არის."], bullets: ["მოინიშნეთ თითოეული დისკის სლოტი და სერიული ნომერი.", "ჩაიწერეთ შეცდომების მიმდევრობა და ბოლო ცვლილებები.", "გადამოწმების გარეშე არ დაიწყოთ ინიციალიზაცია ან იძულებითი ხელახალი აწყობა."] },
        { id: "rebuild", title: "ხელახალი აწყობა აღდგენის გარანტია არ არის", paragraphs: ["Rebuild დაზიანებული ფაილების უნივერსალური აღდგენის ინსტრუმენტი არ არის. მის დაწყებამდე მნიშვნელოვანია დარჩენილი დისკების მდგომარეობა, RAID-ის დონე და სარეზერვო ასლის არსებობა. უკვე მიმდინარე პროცედურაც დაუფიქრებლად არ უნდა შეწყდეს. რამდენიმე პრობლემური დისკის ან გაურკვეველი ისტორიის შემთხვევაში სჯობს სპეციალისტმა შეაფასოს შემდეგი ნაბიჯი."] },
        { id: "backup", title: "RAID და სარეზერვო ასლი განსხვავდება", paragraphs: ["მასივის მდგრადობა შემთხვევითი წაშლისა და ყველა ტიპის ავარიისგან არ იცავს. ცალკე ასლის არსებობა და მისი აღდგენის შემოწმება ამიტომ მნიშვნელოვანია. სერვისს მიაწოდეთ კონტროლერის ან NAS-ის მოდელი, დისკების სრული შემადგენლობა და ბოლო ხელმისაწვდომი ასლის თარიღი. აღდგენის შესაძლებლობა კონკრეტული შემთხვევის მიხედვით ფასდება, არა მხოლოდ დისკების რაოდენობით."] },
      ],
      sources: [{ label: "Synology — მოქმედება მასივის ავარიისას", url: "https://kb.synology.com/en-my/DSM/tutorial/What_do_I_do_when_a_volume_crashes" }, { label: "Synology — საცავის აღდგენის პროცედურა", url: "https://kb.synology.com/en-ro/PAS/help/PAS/StorageManager/storage_pool_repair?version=1_0" }],
    },
    en: {
      title: "First steps after a RAID failure",
      excerpt: "Preserve drive order, record the array status and avoid changes that could make a recovery more difficult.",
      imageAlt: "Data recovery from a RAID array",
      takeaway: "Preserve drive order and configuration after a RAID warning. An unverified rebuild or initialisation can put data at further risk.",
      sections: [
        { id: "state", title: "Record the state before making changes", paragraphs: ["Degraded and crashed are different states. A degraded array may remain accessible with reduced protection; a crashed volume may be unavailable. Capture the status, drive numbers and error messages. Do not try to dismiss a warning by removing drives or creating a new array."] },
        { id: "preserve", title: "Preserve the drive order", paragraphs: ["Limit new writes and preserve existing configuration information. Do not swap drives around. Before shutting down or removing a drive, check the procedure for the exact system. Neither immediate shutdown nor immediate rebuilding is a safe universal instruction."], bullets: ["Record each drive's slot and serial number.", "Note the sequence of failures and recent changes.", "Do not initialise or force a rebuild without verifying the situation."] },
        { id: "rebuild", title: "A rebuild is not guaranteed recovery", paragraphs: ["A rebuild is not a general repair tool for damaged files. Its suitability depends on the remaining drives, RAID level and backup availability. Do not casually interrupt a procedure already in progress either. Multiple suspect drives or an unclear failure history warrant specialist assessment before the next action."] },
        { id: "backup", title: "RAID does not replace a backup", paragraphs: ["Array redundancy does not protect against accidental deletion or every type of failure. Keep a separate backup and test restoration. Provide the service team with the controller or NAS model, full drive inventory and date of the last available copy. Recovery prospects depend on the actual failure, not just the number of drives."] },
      ],
      sources: [{ label: "Synology: What to do when a volume crashes", url: "https://kb.synology.com/en-my/DSM/tutorial/What_do_I_do_when_a_volume_crashes" }, { label: "Synology: Storage-pool repair guidance", url: "https://kb.synology.com/en-ro/PAS/help/PAS/StorageManager/storage_pool_repair?version=1_0" }],
    },
  },
};
