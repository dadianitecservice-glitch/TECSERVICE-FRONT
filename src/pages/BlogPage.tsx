import { useMemo, useRef, useState } from 'react'
import { BlogArticleCard } from '../components/BlogArticleCard'
import { LaptopIcon } from '../components/LaptopIcon'
import { blogCategories, getBlogPosts } from '../data/blogPosts'
import { blogPageCopy } from '../data/blogPageCopy'
import { useTranslation } from '../i18n/LocaleProvider'
import { matchesBlogQuery } from '../utils/blogSearch'
import '../styles/blog-page.css'

export default function BlogPage() {
  const l10n = useTranslation()
  const copy = blogPageCopy[l10n.locale]
  const posts = useMemo(() => getBlogPosts(l10n.locale), [l10n.locale])
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [topicsOpen, setTopicsOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)
  const topicToggleRef = useRef<HTMLButtonElement>(null)
  const clearSearch = () => { setQuery(''); searchRef.current?.focus() }
  const searched = posts.filter(post => matchesBlogQuery(post, query))
  const visible = searched.filter(post => category === 'all' || post.categoryId === category)
  const selectedTopic = category === 'all' ? copy.all : blogCategories.find(item => item.id === category)?.label[l10n.locale]
  const closeTopics = () => {
    setTopicsOpen(false)
    if (topicToggleRef.current?.getClientRects().length) topicToggleRef.current.focus()
  }
  const chooseTopic = (id: string) => {
    setCategory(id)
    if (topicsOpen) closeTopics()
  }

  return <main className="journal-page">
    <section className="journal-intro">
      <div className="site-container">
        <nav className="journal-breadcrumb" aria-label={l10n.locale === 'en' ? 'Breadcrumb' : 'ნავიგაციის გზა'}>
          <a href={l10n.href('/')}>{copy.home}</a><span aria-hidden="true">/</span><span aria-current="page">{copy.title}</span>
        </nav>
        <div className="journal-heading">
          <h1>{copy.indexTitle}</h1>
          <p>{copy.description}</p>
        </div>
      </div>
    </section>

    <section className="site-container journal-library" aria-labelledby="journal-library-title">
      <h2 id="journal-library-title" className="journal-sr-only">{copy.more}</h2>
      <div className="journal-toolbar" data-topics-open={topicsOpen} onKeyDown={event => { if (event.key === 'Escape' && topicsOpen) { event.stopPropagation(); closeTopics() } }}>
        <button className="journal-topic-toggle" type="button" ref={topicToggleRef} aria-controls="blog-filters" aria-expanded={topicsOpen} onClick={() => setTopicsOpen(open => !open)}>
          <span className="journal-sr-only">{copy.categories}: </span><span>{selectedTopic}</span><span className="journal-filter-count" aria-hidden="true">{visible.length}</span><LaptopIcon name="chevron" />
        </button>
        <div id="blog-filters" className="journal-filters" role="group" aria-label={copy.categories}>
          <button type="button" aria-controls="journal-articles" aria-pressed={category === 'all'} onClick={() => chooseTopic('all')}>{copy.all}<span className="journal-filter-count" aria-hidden="true">{searched.length}</span></button>
          {blogCategories.map(item => <button key={item.id} type="button" aria-controls="journal-articles" aria-pressed={category === item.id} onClick={() => chooseTopic(item.id)}>{item.label[l10n.locale]}{category === item.id && <span className="journal-filter-count" aria-hidden="true">{visible.length}</span>}</button>)}
        </div>
        <div className="journal-search"><LaptopIcon name="search" /><label className="journal-sr-only" htmlFor="blog-search">{copy.search}</label><input ref={searchRef} id="blog-search" type="search" autoComplete="off" aria-controls="journal-articles" placeholder={copy.searchPlaceholder} value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Escape' && query) clearSearch() }} />{query && <button type="button" onClick={clearSearch} aria-label={copy.clear}><LaptopIcon name="close" /></button>}</div>
      </div>
      <p className="journal-sr-only" role="status" aria-live="polite">{copy.articleCount(visible.length)}</p>
      <div id="journal-articles">
        {visible.length ? <div className="journal-grid">{visible.map((post, index) => <BlogArticleCard post={post} key={post.id} compact priority={index === 0} />)}</div> : <div className="journal-empty"><LaptopIcon name="search" /><h3>{copy.emptyTitle}</h3><p>{copy.emptyText}</p><button className="journal-link" type="button" onClick={() => {setCategory('all'); clearSearch()}}>{copy.reset}<LaptopIcon name="arrow" /></button></div>}
      </div>
    </section>
  </main>
}
