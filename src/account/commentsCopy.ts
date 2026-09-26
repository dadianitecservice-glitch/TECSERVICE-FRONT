export const commentsCopy = {
  ka: {
    title: 'პროდუქტის კომენტარები', ownTitle: 'ჩემი კომენტარები', publicNotice: 'კომენტარი საჯაროა — მასთან ერთად გამოჩნდება მხოლოდ თქვენი სახელი. არ მიუთითოთ ტელეფონის ნომერი, ელფოსტა ან სხვა პირადი ინფორმაცია.',
    loading: 'კომენტარები იტვირთება…', empty: 'ჯერ კომენტარი არ არის', emptyText: 'გააზიარეთ თქვენი გამოცდილება ამ პროდუქტზე.', ownEmpty: 'კომენტარები ჯერ არ გაქვთ', ownEmptyText: 'პროდუქტზე გამოქვეყნებული თქვენი კომენტარები აქ გამოჩნდება.',
    add: 'კომენტარის დამატება', placeholder: 'დაწერეთ თქვენი აზრი პროდუქტზე…', publish: 'გამოქვეყნება', publishing: 'ქვეყნდება…', published: 'თქვენი კომენტარი გამოქვეყნდა.',
    signIn: 'შესვლა კომენტარის დასამატებლად', approval: 'კომენტარის დასამატებლად ანგარიში დადასტურებული უნდა იყოს.', checking: 'ანგარიში მოწმდება…', manage: 'ჩემი კომენტარების მართვა',
    close: 'ფანჯრის დახურვა', retry: 'ხელახლა ცდა', more: 'მეტის ნახვა', loadingMore: 'იტვირთება…', edit: 'რედაქტირება', remove: 'წაშლა', save: 'ცვლილების შენახვა', saving: 'ინახება…', cancel: 'გაუქმება',
    deleteQuestion: 'წავშალოთ კომენტარი?', deleteText: 'კომენტარი პროდუქტის საჯარო გვერდიდანაც წაიშლება.', confirmDelete: 'დიახ, წაშლა', deleting: 'იშლება…', removed: 'კომენტარი წაიშალა.', saved: 'კომენტარი განახლდა.',
    viewProduct: 'პროდუქტის კომენტარების ნახვა', unavailable: 'პროდუქტი საჯაროდ აღარ არის ხელმისაწვდომი', updated: 'შეცვლილია', reload: 'სიის ხელახლა ჩატვირთვა', remaining: 'სიმბოლო',
    localChanged: 'ცვლილება მხოლოდ ამ გვერდზე აისახა.', localDeleteText: 'კომენტარი მხოლოდ ამ გვერდიდან წაიშლება.',
  },
  en: {
    title: 'Product comments', ownTitle: 'My comments', publicNotice: 'Your comment is public and shows only your first name. Do not include your phone number, email or other private information.',
    loading: 'Loading comments…', empty: 'No comments yet', emptyText: 'Share your experience with this product.', ownEmpty: 'No comments yet', ownEmptyText: 'Your published product comments will appear here.',
    add: 'Add a comment', placeholder: 'Share your thoughts about this product…', publish: 'Publish comment', publishing: 'Publishing…', published: 'Your comment has been published.',
    signIn: 'Sign in to add a comment', approval: 'Your account must be approved before you can comment.', checking: 'Checking your account…', manage: 'Manage my comments',
    close: 'Close dialog', retry: 'Try again', more: 'Load more', loadingMore: 'Loading…', edit: 'Edit', remove: 'Delete', save: 'Save changes', saving: 'Saving…', cancel: 'Cancel',
    deleteQuestion: 'Delete this comment?', deleteText: 'This also removes the comment from the public product page.', confirmDelete: 'Yes, delete', deleting: 'Deleting…', removed: 'Comment deleted.', saved: 'Comment updated.',
    viewProduct: 'View product comments', unavailable: 'This product is no longer publicly available', updated: 'Edited', reload: 'Reload comments', remaining: 'characters',
    localChanged: 'The change applies only to this page.', localDeleteText: 'The comment will be removed from this page only.',
  },
}

export function commentDate(value: string, locale: 'ka' | 'en') {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return '—'
  if (locale === 'ka') {
    const months = ['იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი']
    const parts = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'Asia/Tbilisi' }).formatToParts(date)
    const part = (name: string) => parts.find(item => item.type === name)?.value ?? ''
    return `${part('day')} ${months[Number(part('month')) - 1]}, ${part('year')}`
  }
  return new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Tbilisi' }).format(date)
}
