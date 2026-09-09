export interface Review {
  id: string;
  customerName: string;
  rating: number;
  text: string;
  date: string;
  sourceLabel: string;
}

export interface ReviewSummary {
  rating: number;
  publicReviewCount: number;
}

export const reviewSummary: ReviewSummary = {
  rating: 4.8,
  publicReviewCount: 144,
};

export const reviews: Review[] = [
  {
    "customerName": "beka makadze",
    "date": "5 თვის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT205d1gwRk1TelZmZDFBMFNVeDJOVEUwUkV0Sk1uYxAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "✅⭐⭐⭐⭐⭐✅\nსაკმაოდ კარგი სერვისია, არ არიან კონცენტრირებულები ფულის გაკეთებაზე, სერვისი იდეალურია, მაქსიმალურად ცდილობენ იდეალური ვარიანტები შემოგთავაზონ საკმაოდ მისაღებ ფასად.\nშემოსასვლელში მენეჯერი ან გაყიდვების უფროსი(არვიცი მისი პოზიცია) ძალიან დამეხმარა.\nმოკლედ და კონტრეტულად იდეალური ადგილია ლეპტოპის დასასერვისებლად\nმადლობა კიდევ ერთხელ ✅\n\n✅⭐⭐⭐⭐⭐✅\nA very good service overall — they are not focused on just making money; the service is excellent. They truly try their best to offer you the most suitable options at very reasonable prices.\nAt the entrance, the manager or head of sales (I’m not sure about his exact position) was very helpful.\nIn short and to the point, it’s an ideal place to service your laptop.\nThanks again ✅\n\n✅⭐⭐⭐⭐⭐✅\nОчень хороший сервис — они не сосредоточены только на зарабатывании денег, обслуживание на отличном уровне. Они действительно стараются предложить вам наилучшие варианты по вполне приемлемым ценам.\nНа входе менеджер или руководитель отдела продаж (не знаю его точную должность) очень мне помог.\nКороче говоря, это идеальное место для обслуживания ноутбука.\nЕщё раз спасибо ✅"
  },
  {
    "customerName": "Levani Kurkumuli",
    "date": "6 თვის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT2tKaFZsUXljV0p5TWxCUlYxZGZWbGRSVFZSdlIzYxAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "ძალიან კარგი მომსახურება აქვთ, აკეთებენ დროულად და ხარისხიანად.👍 …"
  },
  {
    "customerName": "LuKicha",
    "date": "ერთი წლის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT2xOVWJ6ZFFjR1pVUVVSelZqaDRNMGhPZEVGamFsRRAB",
    "rating": 3,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "ნორმალურია მაგრამ ცოტა უყურადღებობაა და ყოველი შემთხვევისთვის რა გაგიკეთეს კონკრეტულად თუ რამე მაგალითად GPU ს გახსნას ეხება ფოტოებზე უთხარით რომ გადაიღონ თვითონ არ იღებენ მომსახურება კარგია საერთო ჯამში"
  },
  {
    "customerName": "Jina Guguchia",
    "date": "11 თვის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT25GV2JHNXJVV0Z1YUhNNVJrTklOVzl1TTBReldFRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "გულდასმით იმუშავეს და მაქსიმუმი გააკეთეს, დიდი მადლობა გაწეული შრომისთვის. ჩემი ძველი ლეპტოპი მათი წყალობით კიდევ კარგა ხანს მომემსახურება."
  },
  {
    "customerName": "Zina Gabichvadze",
    "date": "ერთი წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnTUNJd2FtS01BEAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "ძალიან მაგარი გუნდია, შეუძლებელი შეძელით, მკვდარი კომპიუტერი გაცოცხლდა და ახალი სიცოცხლე შეიძინა, მინდა გულრწფელი მადლობა გადაუხადო თქვენს გუნდს, არაჩვეულებრივი სამუშაო გასწიეთ ბატონებო, გისურვებთ წარმატებას, თქვენ საუკეთესოები ხართ თქვენს საქმეში."
  },
  {
    "customerName": "Zakaria N.",
    "date": "2 თვის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT25GR2MzbHJiVmxMZEdGc2RITmpYMUZ3VTNSMlluYxAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "პროფესიული სპეციალისტები და კარგი ხალხი"
  },
  {
    "customerName": "khvicha sidamonidze",
    "date": "ერთი წლის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT2xoQ1FuRklVMHhzZDFwV1RIcHVabVZTVkVkcWNFRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "Საუკეთესო ხარისხის მომსახურება, ზრდილობიანი და  პროფესიონალი თანამშრომლებით 10 დან10"
  },
  {
    "customerName": "Guram Mikiashvili",
    "date": "ერთი წლის წინ",
    "id": "ChdDSUhNMG9nS0VJQ0FnTUNJM3NUb2tBRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "მადლობა ტექსერვის ჯგუფს, სწრაფი დახმარებისა და მეგობრული გარემოსთვის ✌️🙂\nძველი HDD გამეჭედა დაკოპირებისას, აღარ იტვირთებოდა სისტემა, თუმცა ბიოსში ჩანდა HDD. როგორც მითხრეს, თავაკი იყო მცირედ დაზიანებული, შეაკეთეს და ინფორმაციაც ამომიღეს.. …"
  },
  {
    "customerName": "Enzy 1337",
    "date": "ერთი წლის წინ",
    "id": "ChdDSUhNMG9nS0VJQ0FnTUNJM3M2cXN3RRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "ფლეისთეიშენი დავტოვე და ძალიან მალევე შეაკეთეს თან იდიალურად 🙌❤️ რეკომენდაცია ჩემგან, ძალიან თბილი სტაფია ❤️❤️ …"
  },
  {
    "customerName": "Grigol Peradze",
    "date": "7 თვის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT25CSlJWODNNV3R3T0RoaFNUTlhjRzFVUjBWYVYwRRAB",
    "rating": 4,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "გამოცდილი პერსონალი და მეგობრული გარემო"
  },
  {
    "customerName": "Mariam Bolkvadze",
    "date": "ერთი წლის წინ",
    "id": "ChdDSUhNMG9nS0VJQ0FnTUNJX3JyTWlnRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "კარგი პროფესიონალები არიან და ამასთანავე ძალიან სასიამოვნო ადამიანები. კმაყოფილი ვარ სერვისით. დიდი მადლობა ყველას!"
  },
  {
    "customerName": "Maia Mtsariashvili",
    "date": "ერთი წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnTUNvNnYzY0NREAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "პროფესიონალი გუნდი ხართ და ნამდვილად არაჩვეულებრივი სერვისი გაქვთ🙌❤️მადლობა ამისთვის …"
  },
  {
    "customerName": "roman gvamberia",
    "date": "ერთი წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnTUNJdnItc1VnEAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "კმაყოფილი დავრჩი ტექ მომსახურებით და ადამიანურობითაც, რაც ძალიან მახარებს. მადლობა."
  },
  {
    "customerName": "Giorgi Iashagashvili",
    "date": "ერთი წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnTUNJNGNXN0dREAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "იდეალური მომსახურება, თბილი გარემო და რაც მთავარია პუნქტუალურობა."
  },
  {
    "customerName": "nika pitskhelauri",
    "date": "4 წლის წინ",
    "id": "ChdDSUhNMG9nS0VJQ0FnSUNtOUtQRy1RRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "გამიფუჭდა სმარტ მტვერსასრუტი, მეგონა რაღაც დაეწვა, მივუტანე, იმავე დღეს  დამიკავშირდენენ, აღომჩნდა მხოლოდ დარესეტება უნდოდა და სრულიად უფასოდ დამიბრუნეს პილასოს სრულ სამუშოა ფორმაში :) მადლობა !!👍👍 …"
  },
  {
    "customerName": "Zaza Tabatadze",
    "date": "ერთი წლის წინ",
    "id": "ChdDSUhNMG9nS0VOTHJvY25ldHZIUHZ3RRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "პროფესიონალებით დაკომპლექტებული გუნდი პლიუს მომსახურება უმაღლეს დონეზე"
  },
  {
    "customerName": "Tornike Lelashvili",
    "date": "რედაქტირებულია: ერთი წლის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT2xSRmQzZFBUWE4zZFdkVGJrbE1XR05NUVRabWVVRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "მეგობრული გარემო, პროფესიონალური და სწრაფი მომსახურება 🙏 …"
  },
  {
    "customerName": "Giorgi Macharashvili",
    "date": "2 წლის წინ",
    "id": "ChdDSUhNMG9nS0VJQ0FnSUNadllyQ2pnRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "სწრაფი და ხარისხიანი სერვისი აქვთ,გმაყოფილი ვარ ✅ ს.ე"
  },
  {
    "customerName": "Teona Koridze",
    "date": "4 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSUNHNDR2TWVREAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "უმაგრესი  გუნდი პროფესიონალები და მაღალი ხარისხის ტექნიკა მომსახურება სუპერ🥰❤️ …"
  },
  {
    "customerName": "eka maisuradze",
    "date": "2 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSUNaa2ZtZGRREAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "ყურადღებიანი პროფესიონალების გუნდი აღმოვაჩინე და შემდეგშიც მივმართავ მათ:)"
  },
  {
    "customerName": "Giorgi Iluridze",
    "date": "11 თვის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT21OVVIxRnZiblJoVFRJMFRWUTVMVEJZWTBoUVNVRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "იდეალურად აკეთებენ ნებისმიერ ტექნიკას"
  },
  {
    "customerName": "Toko Kacadze",
    "date": "11 თვის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT2s5V2NqUmhiUzFsYm1sR056aHBObnBtTUhsSk5XYxAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "საუკეთესო კომპანიაა და სანდო 🥰🥰🥰🥰 …"
  },
  {
    "customerName": "Bekar Modebadze",
    "date": "ერთი წლის წინ",
    "id": "ChdDSUhNMG9nS0VJQ0FnTUNJM29ybW93RRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "პროფესიონალები არიან თავის საქმის"
  },
  {
    "customerName": "Tato Tato",
    "date": "ერთი წლის წინ",
    "id": "ChdDSUhNMG9nS0VJQ0FnTUNJM3JxRnZnRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "ძაან კარგი მომსახურეობაა❤️"
  },
  {
    "customerName": "polar izing",
    "date": "2 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSURaZ0wtS09BEAE",
    "rating": 3,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "დროის მენეჯმენტზე აქვთ სამუშაო დანარჩენი ნორმ"
  },
  {
    "customerName": "Hogy",
    "date": "2 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSUM1OHRpeGJBEAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "კარგი მომსახურება დაბალი ფასები მადლობა"
  },
  {
    "customerName": "Nika Buzaladze",
    "date": "ერთი წლის წინ",
    "id": "ChdDSUhNMG9nS0VJQ0FnTUNJM3QyVm9nRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "პროფესიონალთა გუნდი ხართ 👍👌 …"
  },
  {
    "customerName": "Aram Maroyan",
    "date": "8 წლის წინ",
    "id": "ChdDSUhNMG9nS0VJQ0FnSURReGZDSnpBRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "ძალიან კმაყოფილი ვარ თქვენი სერვისით!!!"
  },
  {
    "customerName": "kaxa Jachvadze",
    "date": "3 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSURwZ3ZXM0tnEAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "დიდი მადლობა საუკეთესო მომსახურება გაქვთ"
  },
  {
    "customerName": "დავით სირბილაშვილი",
    "date": "3 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSURwakplWWZ3EAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "კარგი სერვისი აქვთ, ყველას გირჩევთ👏🏻 …"
  },
  {
    "customerName": "Beka Sirbilashvili",
    "date": "3 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSURweXJUQVJREAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "ძალიან კმაყოფილი ვარ👍🏻👍🏻👍🏻👍🏻👍🏻 …"
  },
  {
    "customerName": "aneex aneex",
    "date": "2 წლის წინ",
    "id": "ChdDSUhNMG9nS0VJQ0FnSUNaX1lmOWl3RRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "კარგი მომსახურეობაა ს.ე"
  },
  {
    "customerName": "AKaki Bzhalava",
    "date": "3 წლის წინ",
    "id": "ChdDSUhNMG9nS0VJQ0FnSURKb0lycDdnRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "ძალიან კარგი მომსახურება"
  },
  {
    "customerName": "გიორგი ბარბაქაძე",
    "date": "3 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSUMtOVA3NU93EAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "კარგად აკეთებენ ყველაფერს"
  },
  {
    "customerName": "ბექა ღარიბაშვილი",
    "date": "3 წლის წინ",
    "id": "ChdDSUhNMG9nS0VJQ0FnSURwOGQyVG5RRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "საუკეთესო სერვისი გაქვთ"
  },
  {
    "customerName": "nata jachvadze",
    "date": "3 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSURwZ3QtYWFBEAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "საუკეთესო მომსახურება ❤️"
  },
  {
    "customerName": "gio modzmanashvili",
    "date": "ერთი წლის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT25Ka05FcE5SbVp3TmxrNGEyTlJVbGRTU0RReWNWRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "საუკეთესო"
  },
  {
    "customerName": "Saba Trapaidze",
    "date": "2 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSUNac1pxY0l3EAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "უმაგრესი გუნდი🤝🏻💻 …"
  },
  {
    "customerName": "arturi feroiani",
    "date": "3 წლის წინ",
    "id": "ChdDSUhNMG9nS0VJQ0FnSURweWZTZnRnRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "👍 …"
  },
  {
    "customerName": "Levan Odilavadze",
    "date": "ერთი დღის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT2pNd1F6ZEVaR05sVFdsTlJEVjBWVWxMVDJ0VlFWRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "თბილისში საუკეთესო სერვისი!!!"
  },
  {
    "customerName": "nia norakidze",
    "date": "6 დღის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT2poeVRHTjNkRXBFVmpCWlJqTnhSV0V0TUROdVdHYxAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "ტექსერვისს ორჯერ მივმართე და ძალიან კმაყოფილი ვარ მათი მომსახურებით! პასუხისმგებლიანად ეკიდებიან საქმეს და გულწრფელად ცდილობენ პრობლემის მოგვარებას 😊 …"
  },
  {
    "customerName": "Tato Zakareishvili",
    "date": "6 დღის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT21kemIzTTFOSGM1WDJVd1JsQlhhek0yTmpkcGVFRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "თქვენ ხართ საუკეთესოები 💜 …"
  },
  {
    "customerName": "Lia Kiria",
    "date": "2 კვირის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT25sM2VtWnpiSEp4Y1dwVFVIZG5jbEJDUVhZdE5sRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "საუკეთესოზე საუკეთესო. შეცვალეს ლეპტოპზე ხუფი უმოკლეს დროში, რაც მოვიტანე ნაწილები ყველაფერი ისევე ისე დამიბრუნეს რაც არ დაჭირდათ, თავაზიანები და ფასი ადეკვატური! ჩემი უდიდესი რეკომენდაცია!!!\n\nЗа пару часов сменили крышку на ноуте, за который либо никто не брался, либо загибали нереальные цены. Эти парни быстро, спокойно за очень приятную цену без слов сделали свою работу на отлично! Рекомендую всем!"
  },
  {
    "customerName": "sopo Kartsivadze",
    "date": "ერთი თვის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT2xkWWQzbHJSblY1Um1Zd2IzazVXa3hSTVRoRlVuYxAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "საუკეთესო გუნდი...ძალიან კარგი ადამიანებით...."
  },
  {
    "customerName": "Daniel Z.",
    "date": "6 თვის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT20xUGVGTmhRbTlxUnpNMGEzWm5OVTFoV0RkaFoyYxAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "Я живу в Израиле, был в Тбилиси как турист. У меня был старый жесткий диск, на котором были фотографии детей, также с родов младшего сына. Диск случайно упал со стола и была повреждена читающая головка.  Было очень жалко потерять детские фотографии. Я обратился в лабораторию в Израиле, они запросили за восстановление диска крупную сумму денег. Когда я был в Тбилиси, я решил обратиться в лабораторию на Дадиани. Это была сложная работа, так как жесткий диск фирмы Hitachi (не распространенная фирма) и трудно было достать донорскую запчасть. В итоге донорская часть была заказана в интернете и фотографии были восстановлены!!!!\nЯ хотел бы поблагодарить сервис на Дадиани. Большое им списибо!!!! Браво!!!"
  },
  {
    "customerName": "Oleksandr Vyshnevetskyi",
    "date": "9 თვის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT2xGclpWOVFlRU5YYWxGclF5MWpUMGhxYTFSU1QzYxAB",
    "rating": 1,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "They have no idea what theyre doing.\n\nI bring AM5 PC for diagnostics,  they say motherboard is dead, but they didn't have a am5 cpu to check, so how do they know? They dont know!!\n\nI bought a new motherboard and the pc still doesn't turn on.\n\nThey just didn't check anything and said its a motherboard and now I wasted 500 gel on the new mobo because of them\n\n500gel mobo!!!!!!!!"
  },
  {
    "customerName": "Laverne Sani",
    "date": "ერთი წლის წინ",
    "id": "ChdDSUhNMG9nS0VPbjF3ZFgwMjlTazd3RRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "I recently asked Tech Service to replace a transistor on a control board for a specialized piece of equipment. They were incredibly professional throughout the process, and I was relieved that they spoke to me in English, which made everything so much easier to understand. Honestly, I didn’t think it was possible for them to fix this item, but they did an outstanding job. I’m incredibly grateful and couldn’t be happier with their service and work! Thank you so much to Nika and team!"
  },
  {
    "customerName": "2KickAround",
    "date": "ერთი წლის წინ",
    "id": "ChZDSUhNMG9nS0VPaXdpclQtNnItMU1REAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "We don’t know what we would have done without the help of these guys! They were data recovery genius’s! We had multiple SD cards that corrupted and lost all of our data, they were able to recover it and get everything done in just a few days. They even worked on it during a holiday because we needed to leave town, which was so kind of them. We highly recommend for any electronic help they can work on everything!"
  },
  {
    "customerName": "Роман Зайчик",
    "date": "რედაქტირებულია: ერთი წლის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT2tJNGFGWlZhWEl6VEZaR2MwSlNaVzVPWjBsWlFuYxAB",
    "rating": 2,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "Дружная команда профессионалов. Пришел к ним с сильно загрязнённым ноутбуком. На месте сразу провели всю необходимую диагностику и чистку. Дали подробные рекомендации по обслуживанию. Огромная благодарность и искренне рекомендую этот сервис.\n\nОбновление. Первоначальный отзыв оставляю, но оценку меняю и подробно рассказываю почему и что было. Итак у меня изначально был полностью исправный дорогой игровой ноутбук Asus. Единственная проблема - за 4 года эксплуатации я его не чистил ни разу. Соответственно перед продолжением своего путешествия я решил обратиться в этот сервис с целью очистки этого ноутбука. Мне была озвучена цена в 150 лари, на которую я согласился. Очистка была произведена и мастера сказали мне следующее: вентилятор процессора сильно загрязнён и не подлежит очистке. Необходима его замена. У них такого вентилятора нет и найти замену в кратчайшие сроки в Тбилиси практически невозможно (что в последствии оказалось правдой). Любезно указали мне маркировку вентилятора и сайт, где его можно будет впоследствии заказать. Чтож я расплатился за услугу и оставил отзыв на 5 звёзд, который и сохраняю выше для истории.\n\nЧто дальше. По приезду домой я обнаружил, что ноутбук работает от сети, но батарея более не заряжается. На другой день утром я возвратился с ноутбуком в сервис. После примерно 2.5 часов диагностики проблема выявлена не была. Мне было предложено оставить ноутбук на дополнительную диагностику ещё на 1-1.5 суток, от чего я отказался. У меня уже не было на это времени, да и доверие к сервису как-то пропало. Я нашёл адрес официального сервисного центра фирмы Asus в Тбилиси. Ребята любезно позвонили в этот сервисный центр и договорились о моём визите туда.\n\nБеру такси и еду в сервисный центр Asus. Там диагностика занимает 5-7 рабочих дней. У меня столько времени нет. Куплен билет на самолёт и мне через 3 дня улетать. Ищу в Гугле другой сервисный центр. Созваниваюсь, приезжаю к ним. Они открывают ноутбук, видят плохо работающий вентилятор и отказываются с ним работать, так как опасаются перегрева и порчи ноутбука. В этом сервисном центре любезно подсказывают мне где есть вероятность найти необходимый вентилятор процессора. Надо обойти пару десятков локаций и мастеров и спрашивать у них. В ужасе выбегаю на улицу и начинаю поиски.\n\nОказываюсь в пассаже возле станции метро, где куча разных маленьких павильонов. Спрашиваю, где есть ремонт ноутбуков. Мне указывают номер павильона. Так я нахожу совершенно случайного, нигде не разрекламированного мастера. Показываю ему свой ноутбук. Он пытается подобрать необходимый вентилятор процессора и не находит. Тогда он берёт мой старый грязный вентилятор процессора, открывает его, чистит, смазывает, балансирует и в результате я получаю идеально работающий исправленный вентилятор! Вот значит как? Мастера в раскрученном сервисном центре чистить вентилятор не умеют, а случайный мастер в маленьком павильоне делает это не напрягаясь. Проблему с питанием батареи этот мастер решить не смог, но предложил мне на следующий день обратиться к другому мастеру, специализирующемуся на электронике. От души отдал этому мастеру - спасителю 100 лари. Он даже цену называть не хотел. Ну вот так я оценил его профессионализм и мастерство. Надеюсь, что более или менее справедливо.\n\nНа следующий день приезжаю к мастеру по электронике. Он потребовал 3 часа на диагностику. Возвращаюсь через 3 часа. Вердикт: на плате сгорели 3 микросхемы. Стоимость ремонта 250 лари. Я безусловно согласился и ремонт был произведен. Предположить что-то иное, кроме как ошибку при первоначальной чистке ноутбука сложно. Ноутбук изначально был в полностью исправном состоянии, хоть и загрязнённый пылью.\n\nИтог: простая чистка ноутбука превратилась в 3 дня беготни, траты нервов, времени и денег. Я не сомневаюсь, что работники этого сервиса хотели и пытались сделать свою работу хорошо. Но если у вас недостаточно необходимых знаний и навыков, чтобы с уверенностью выполнить такую работу, так может быть не стоит просто браться за обслуживание такой дорогостоящей техники? По результатам ставлю этому сервису жирную двойку."
  },
  {
    "customerName": "Antonio Pieri",
    "date": "ერთი წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnTUNJb2ZfZ0dREAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "Amazing team. A stray cat smashed by external disk in my hotel. and the Tecservice Team managed to recover 99% of the data on my HD, but most of all to recover the last three chapters of my upcoming new book. Thanks a lot, guys. İ love you a lot. And, for sure, İ will be back for other tech related jobs. By for now."
  },
  {
    "customerName": "Davit Meparishvili",
    "date": "2 თვის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT20xSlEwd3dSMUZPUkVOMVJVbE5SRTg0VkV0ak5sRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "მათ გამოასწორეს ჩემი GPU, რომელიც მუშაობდა SD დისკზე, როგორც მოსალოდნელი იყო."
  },
  {
    "customerName": "sandro Gzirishvili",
    "date": "ერთი წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnTUNJM3VuRlpBEAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "3.5 წელზე მეტია, რაც ამ ბიჭებთან დავდივარ ჩემი ლეპტოპის გასაწმენდად და ჯერჯერობით ყველაფერი კარგადაა. კარგი მომსახურება, სწრაფი და მარტივი."
  },
  {
    "customerName": "koko tsurtsumia (kokucha)",
    "date": "ერთი წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnTUNJM3Z1Q1pnEAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "იდეალური ადგილია, მოვახერხე დედაპლატზე მოღუნული პინების შეკეთება, კაბელების მართვა, ყველაფერი გავწმინდე და საერთო ჯამში ძალიან მეგობრული ვიყავი, ძალიან კარგი ფასებით, ჩემი აზრით, უბრალოდ იდეალური ადგილია."
  },
  {
    "customerName": "Elman Mamedovi",
    "date": "5 თვის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT2trNWRWbDVXR2xOVlVsMWMycFVjWGhhWlUxMmIwRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "🤝❤️ …"
  },
  {
    "customerName": "Marta M.A",
    "date": "ერთი წლის წინ",
    "id": "ChdDSUhNMG9nS0VJQ0FnSURfLXBYbjVnRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "შესანიშნავი მომსახურება სამართლიანი ფასებით. ძალიან პასუხისმგებლიანი. გირჩევთ ❣️"
  },
  {
    "customerName": "Svetlana Manilo",
    "date": "11 თვის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT2s4Mk5WWmZWWGcwZFVVdFRqRjRWRUp3Um5wbllVRRAB",
    "rating": 3,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "არც ისე თავაზიანი მომსახურება. სხვა ადგილი ავირჩიე."
  },
  {
    "customerName": "Сергій Льова",
    "date": "ერთი წლის წინ",
    "id": "ChZDSUhNMG9nS0VNRzQzcWZuMGM3akhREAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "ყველაფერი ისე გააკეთეს, როგორც მინდოდა და კარგადაც გაართვეს თავი, გირჩევთ."
  },
  {
    "customerName": "Tekla Solomonishvili",
    "date": "3 თვის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT2paYWNXZHBaMmhIU0RBd2NHUTVUbk5mZFZCS2EwRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "შესანიშნავი მომსახურება"
  },
  {
    "customerName": "Alex Greb",
    "date": "2 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSURaNnNpSUh3EAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "ბიჭებმა ჩემი ლეპტოპი ერთ სამუშაო დღეში გადამარჩინეს. სწრაფად და კარგად იმუშავეს."
  },
  {
    "customerName": "beka beradze",
    "date": "7 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSUNJM3BMdE5BEAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "5 ვარსკვლავი"
  },
  {
    "customerName": "guka kupatadze",
    "date": "რედაქტირებულია: ერთი წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSUNONUptb0JREAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Leri Kov",
    "date": "11 თვის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT2pCMlZteG9hemgyYkVSNFNHTmZhazV4T0daT05FRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "გირჩევთ ამ სერვისს"
  },
  {
    "customerName": "aleksandr mchedlishvili",
    "date": "რედაქტირებულია: 8 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSUNBb2VIbUN3EAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "კარგი"
  },
  {
    "customerName": "qurdadze luka",
    "date": "4 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSURtN0w3dmZREAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "კაია"
  },
  {
    "customerName": "nika sirbilashvili",
    "date": "4 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSUNHNDgzZFVBEAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "giorgi tabatadze",
    "date": "რედაქტირებულია: 2 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSUNHaTQzYVh3EAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "saba trapaidze",
    "date": "4 წლის წინ",
    "id": "ChdDSUhNMG9nS0VJQ0FnSUNHMDdpWDhBRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "lalo lalo",
    "date": "4 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSUNHMC1DTEl3EAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "akaki ozashvili",
    "date": "3 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSUNaX01uRk9BEAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "საოცარი ბიჭები"
  },
  {
    "customerName": "gurami elizbarashvili",
    "date": "2 კვირის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT2twMVRWSkNOamxhY21KQ1MxRlFhMFZTUlRSNExWRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Li Lea",
    "date": "2 კვირის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT2toalVsQkZkVXM1VWpCbU5GWmhkM0ZDVGpCck1FRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "პროფესიონალების შესანიშნავი გუნდი, სამუშაო შესრულდა სწრაფად და ეფექტურად, მომსახურება იყო უმაღლესი დონის და, რაც მთავარია, ისინი არ ცდილობენ მოტყუებას, ისინი სრულიად მომხმარებელზე ორიენტირებულები არიან, ფასები გონივრულია, გირჩევთ! ❤️‍🔥💯❤️❤️❤️❤️❤️ …"
  },
  {
    "customerName": "Ilia Okromelidze",
    "date": "2 კვირის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT2tkZlVsSjNaMU5HZUZkdFFtSTJhRWRaTVRGbkxWRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Nick Gelashvili",
    "date": "4 კვირის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT2pGTWVXODBZM2Q0TlZaZk9IaFhZV1kxVVhsemFrRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "შესანიშნავი მომსახურება დრონებისა და სხვა ელექტრონიკის სფეროში ძლიერი ტექნიკური ექსპერტიზით. გუნდი პროფესიონალი, კომპეტენტური და გულწრფელად გამოსადეგია. დიდი სიამოვნებით გირჩევთ!"
  },
  {
    "customerName": "Mariam Antadze",
    "date": "ერთი თვის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT25aWlVuTk9hak54WWxoSlFUZEVUMlY0UldKa1UyYxAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Кот",
    "date": "4 თვის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT2kwd2JGcDJjR1pYZUUxeE1UUmpVRmxMWm1FekxWRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": "განსაკუთრებული მადლობა ნიკას Sandisk SSD-ის გაყიდვაში დახმარებისთვის! საუკეთესო მომსახურება ქალაქში!"
  },
  {
    "customerName": "giorgi gurjidze",
    "date": "5 თვის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT2xGTFFtSnVNSEZNY1RKeldWbzRRbXhQVTA1ME9YYxAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Anna Petrosyan",
    "date": "5 თვის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT2pSbFJUSmtRMlI0VlZsUk5XTk1OMm96WWxkYVJHYxAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "guka kupatadze",
    "date": "5 თვის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT21wNFNFUTJNek13WTNCTGRFVTFRa05MVjFoNGEzYxAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "შაკო ბახტურიძე",
    "date": "6 თვის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT2pkbU5uTnlVVXRPT1U5b2FrMTNSbEoxWVc1VGFWRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "nika gvinepadze",
    "date": "6 თვის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT21vME1rbEdaRXRQWmpOMmNWWXpkemhrYUVSV1JFRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Otari Zarqua",
    "date": "10 თვის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT21keFRucERaM1JHUm1GTlJXRldWbnBuUVZNeFZuYxAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "cici palavandishvili",
    "date": "10 თვის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT201MGRUZFZWM3BaTTNwUVowRnFObTlvTTFWUVMzYxAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "shorena velijanashvili",
    "date": "11 თვის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT2xsT2VuWkpVbTlDV0hZMmVYQnFVRXBwVEVWU2RGRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Vita Gardenia Hotel Tskaltubo",
    "date": "11 თვის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT2sxRlIxZ3dOVzF6Tm0wek9GSlNMV3R4VVROT1NrRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "mamuka tsetskhladze",
    "date": "11 თვის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT21wbVFsaFNXa1pPZWpSNWJIcHhkQzF3Ym5CS1EyYxAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Ilya Omelchenko",
    "date": "11 თვის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT210a1IyMXFRbU5MZFRScU5WQlZjV3M1YUUxNFZXYxAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "დავით სარსანია",
    "date": "11 თვის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT2toemRVTmFXR2Q2VG1kQ1ZYQjFWelpNTUZkMkxVRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Batu Shulaia",
    "date": "11 თვის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT25Ob1RUSjBUbEYzY0ZacWNWRmZjWEprUzNGMk1FRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Mariam Beridze",
    "date": "ერთი წლის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT21NNVRrdHlSMmxUVEVaWWNFZEROQzFaY1ZKd1ExRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Vako Patashuri",
    "date": "ერთი წლის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT2xwRWFtSjNiRXBtT1ZweFVIWklNMnBOU3poM00xRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "elene gvimradze",
    "date": "ერთი წლის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT2kxYWJrdzJNME5wU25SemMyWjFkVjluVDNkTWRuYxAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "ნიკა კრაწაშვილი",
    "date": "ერთი წლის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT21wUU0xVlNiMVUzYmt3eFQzSkpia2x3UWw5R1JWRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Sohpie Vibliani",
    "date": "ერთი წლის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT25saVZVNXdPWGhpUldwVWVIVTROM1Z2VkU1VlgwRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "zura mzarelua",
    "date": "ერთი წლის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT2xCR1JsaE5jemRmYjBoeWEwWnZSamcyT1VjMFVHYxAB",
    "rating": 1,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Nino Rukhadze",
    "date": "ერთი წლის წინ",
    "id": "Ci9DQUlRQUNvZENodHljRjlvT25STE1WZGxUbUZEVDNCWE1qbElPRU0zZVU0NU5XYxAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "ლევან კოტორაშვილი",
    "date": "რედაქტირებულია: ერთი წლის წინ",
    "id": "ChZDSUhNMG9nS0VLX2xfNlB5dkpuVEtnEAE",
    "rating": 3,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Tozi Bazadze",
    "date": "ერთი წლის წინ",
    "id": "ChdDSUhNMG9nS0VKcVloLVduNmNhV2lnRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "ana Margishvili",
    "date": "ერთი წლის წინ",
    "id": "ChdDSUhNMG9nS0VKX0MwX3pabjlHRTBRRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "megi sajaia",
    "date": "ერთი წლის წინ",
    "id": "ChdDSUhNMG9nS0VJQ0FnTUNZaEk3STFnRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Giorgi Rekhviashvili",
    "date": "ერთი წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnTUNvNnB2UkRnEAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "valeri talaxadze",
    "date": "ერთი წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnTUNJaGRyM0xREAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Giorgi Berdzenishvili",
    "date": "ერთი წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnTUNJa2E3WUJ3EAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "diovaso Beglara",
    "date": "ერთი წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnTUNJdnBTR1lnEAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Gela Shekeladze",
    "date": "ერთი წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnTUNJM3RmaU1BEAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Giorgi Lekiashvili",
    "date": "ერთი წლის წინ",
    "id": "ChdDSUhNMG9nS0VJQ0FnTUNJM3V6eDVRRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Lika Beridzishvili",
    "date": "რედაქტირებულია: ერთი წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnTUR3c2ZUcUJ3EAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Ani Tsukhishvili",
    "date": "ერთი წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnTUNJM3NqYmNREAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Tika Beridzishvili",
    "date": "ერთი წლის წინ",
    "id": "ChdDSUhNMG9nS0VJQ0FnTUNJb3Z6N2tnRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Zurabi Gelashvili",
    "date": "ერთი წლის წინ",
    "id": "ChdDSUhNMG9nS0VJQ0FnTUR3bGRYem53RRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Davit Aslamadze",
    "date": "ერთი წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnTUR3NWFDOFB3EAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Shalva Abuladze",
    "date": "ერთი წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnTUR3c2ZUd2VBEAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "David Tcheishvili",
    "date": "ერთი წლის წინ",
    "id": "ChdDSUhNMG9nS0VJQ0FnSUNfeE12ZzlBRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Pako Migdo",
    "date": "2 წლის წინ",
    "id": "ChdDSUhNMG9nS0VJQ0FnSURULUo3VW1nRRAB",
    "rating": 1,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "ემზარ სუხიტაშვილი",
    "date": "2 წლის წინ",
    "id": "ChdDSUhNMG9nS0VJQ0FnSUNOOU5QaDBRRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Aleksandr Ermakov",
    "date": "2 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSUMxZ29pdkhREAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Zuka Mumladze",
    "date": "2 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSUNsNFpuX1RnEAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Luka Iremadze",
    "date": "2 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSUQ1aVpiZFFREAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "დავით ჟღენტი",
    "date": "2 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSURaMXNTZ1JBEAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "არჩილი ხახანაშვილი",
    "date": "2 წლის წინ",
    "id": "ChdDSUhNMG9nS0VJQ0FnSUNabDYzVDdnRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "natia beglarashvili",
    "date": "2 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSUNacGZydmV3EAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Marika Lapachi",
    "date": "2 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSUNaMFptVFh3EAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Malkhaz Batsanadze",
    "date": "2 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSUNaa2FPYUJnEAE",
    "rating": 4,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Natia Amaghlobeli",
    "date": "2 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSUNaa2FYc2NnEAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "giorgi begizashvili",
    "date": "2 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSUNaa2ZtOVB3EAE",
    "rating": 1,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "salome maisuradze",
    "date": "რედაქტირებულია: 2 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSURHM3Vld0dREAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Temo Tuxareli",
    "date": "3 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSUNaNnBITEV3EAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "დათო ხაჩიძე",
    "date": "3 წლის წინ",
    "id": "ChdDSUhNMG9nS0VJQ0FnSUNacXNMVG1RRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "rati chitishvili",
    "date": "3 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSUNad3JqVGNREAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Sergo Kenia",
    "date": "3 წლის წინ",
    "id": "ChdDSUhNMG9nS0VJQ0FnSUNadEtuOGx3RRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Nano Kowi",
    "date": "3 წლის წინ",
    "id": "ChdDSUhNMG9nS0VJQ0FnSUNac09PTnFBRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "iveri xaradze",
    "date": "3 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSURwcF8tR1NREAE",
    "rating": 4,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Levani Sirbilashvili",
    "date": "3 წლის წინ",
    "id": "ChdDSUhNMG9nS0VJQ0FnSURweXVyRGlRRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "nanuka tkhlashidze",
    "date": "3 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSURwOHFLdEpnEAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Qeti Zurashvili",
    "date": "3 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSUNwdUoyZFNnEAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "lekso skhirtladze",
    "date": "4 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSUNHczZfZFRnEAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Aleksandr Vavilov",
    "date": "5 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSUNLeHJxbmZ3EAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Niko Lozi",
    "date": "5 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSUNpN0tYMWN3EAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "nino khosiashvili",
    "date": "5 წლის წინ",
    "id": "ChdDSUhNMG9nS0VJQ0FnSURDMnBlQTNRRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Tamar Beniaidze",
    "date": "6 წლის წინ",
    "id": "ChdDSUhNMG9nS0VJQ0FnSUNDbHRieDFnRRAB",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Gurami Xunashvili",
    "date": "6 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSUNjMS0yNE1BEAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Saba Molashvili",
    "date": "6 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSUMwcl9Uc2N3EAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Beka Chodrishvili",
    "date": "7 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSUNvdHNYeUNBEAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Mikheil Tetradze",
    "date": "9 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSURBdjgtZFh3EAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  },
  {
    "customerName": "Luka Tsulaia",
    "date": "9 წლის წინ",
    "id": "ChZDSUhNMG9nS0VJQ0FnSUNBdWZTSlJBEAE",
    "rating": 5,
    "sourceLabel": "Google Maps · რეალური მომხმარებლის შეფასება",
    "text": ""
  }
];

export const googleReviewsUrl =
  "https://www.google.com/maps/place/TecService+-+%E1%83%A2%E1%83%94%E1%83%A5%E1%83%A1%E1%83%94%E1%83%A0%E1%83%95%E1%83%98%E1%83%A1%E1%83%98/@41.7193573,44.8034385,171m/data=!3m1!1e3!4m6!3m5!1s0x40440d318fe65ddd:0xc417758abd3c535c!8m2!3d41.7188516!4d44.8036156!16s%2Fg%2F11cjhyk5qg";
