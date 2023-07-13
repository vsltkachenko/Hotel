// Підключення функціоналу 
import SmoothScroll from 'smooth-scroll'
import { isMobile, menuClose } from './functions.js'

// ============================================================================================================================================================================================================================================================================================================================================================================================
// Magic-Line для меню
export function magicLineMenu() {
	const LINE_COLOR = '#ff7500'
	const list = document.querySelector('[data-line-list]') // <ul></ul>
	const items = list.querySelectorAll('[data-line-item]') // [<li></li>]
	list.style.position = 'relative'

	// Створення Magic-Line
	const line = document.createElement('span')
	line.classList.add('nav__line')
	line.style.cssText = `position: absolute; left: 0; height: 3px; top: -7px;  background-color: ${LINE_COLOR}; transition: all 0.5s ease; border-radius: 5px; width:1px;`
	list.prepend(line)

	let lineWidth
	let lineLeft
	let lineTop
	// Функція присвоєння актуального розміру та позиції Magic-Line
	function changeLinePosition(width, left, top = 0) {
		line.style.width = `${width}px`
		line.style.left = `${left}px`
		line.style.top = `${top - 7}px`		
	}
	// Відстеження додавання класу '_active' до link
	let observer = new MutationObserver(function (mutations) {		
		for (let mutation of mutations) {
			if (mutation.target.classList.contains('_active')) {				
				lineWidth = mutation.target.parentElement.offsetWidth
				lineLeft = mutation.target.parentElement.offsetLeft
				lineTop = mutation.target.parentElement.offsetTop				
				changeLinePosition(lineWidth, lineLeft, lineTop)
			}
		}
	})

	// Ініціалізація. Пошук link з класом '_active'
	// Присвоєння стартової позиції Magic-Line
	setTimeout(() => {
		items.forEach((item) => {
			let link = item.querySelector('a') // <a></a>
			if (link.classList.contains('_active')) {
				lineWidth = item.offsetWidth
				lineLeft = item.offsetLeft
				lineTop = item.offsetTop
				changeLinePosition(lineWidth, lineLeft, lineTop)
			}
			if (!isMobile.any()) {
				addListenerMouseEnter(item)
			} else {
				// console.log('isMobile. Не відстежуємо mouseenter')
			}

			// Ініціалізація відстеження змін в об'єктах link (додавання класу '_active')
			observer.observe(link, { attributes: true })
		})
		if (!isMobile.any()) {
			addListenerMouseLeave()
		} else {
			// console.log('isMobile. Не відстежуємо mouseleave')
		}
	}, 300)

	//*******************************************************************
	let mouseEnterListener = function (item) {
		return function (event) {
			// console.log('Відстежуємо слухач mouseenter')
			changeLinePosition(item.offsetWidth, item.offsetLeft)
		}
	}
	function addListenerMouseEnter(item) {
		item.addEventListener('mouseenter', mouseEnterListener(item))
	}
	function removeListenerMouseEnter(item) {
		item.removeEventListener('mouseenter', mouseEnterListener(item))
		// console.log('Видаляємо слухач mouseenter')
	}
	//*******************************************************************
	let mouseLeaveListener = function (event) {
		changeLinePosition(lineWidth, lineLeft)
		// console.log('Відстежуємо слухач mouseleave')
	}
	function addListenerMouseLeave() {
		list.addEventListener('mouseleave', mouseLeaveListener)
	}
	function removeListenerMouseLeave() {
		list.removeEventListener('mouseleave', mouseLeaveListener)
		// console.log('Видаляємо слухач mouseleave')
	}
	//*******************************************************************

	//************************* Fix при resize **************************
	window.addEventListener('resize', debounce(windowSizeChanged))

	function windowSizeChanged() {
		console.log('Розмір вікна змінено')

		const list = document.querySelector('[data-line-list]') // <ul></ul>
		const items = list.querySelectorAll('[data-line-item]') // <li></li>
		items.forEach((item) => {
			let link = item.querySelector('a')
			if (link.classList.contains('_active')) {
				lineWidth = item.offsetWidth
				lineLeft = item.offsetLeft
				lineTop = item.offsetTop
				
				changeLinePosition(lineWidth, lineLeft, lineTop)
			}
			if (isMobile.any() || isMobileWidth()) {
				removeListenerMouseEnter(item)
			} else {
				addListenerMouseEnter(item)
			}
		})

		if (isMobile.any() || isMobileWidth()) {
			removeListenerMouseLeave()
		} else {
			addListenerMouseLeave()
		}
		!isMobileWidth() && menuClose()
	}
	function debounce(fn, ms = 500) {
		let timeout
		return function () {
			const fnCall = () => {
				fn.apply(this, arguments)
			}
			clearTimeout(timeout)
			timeout = setTimeout(fnCall, ms)
		}
	}
	//*******************************************************************
}
// ============================================================================================================================================================================================================================================================================================================================================================================================
//Прокрутка до блоку при кліку
export function gotoSection() {
	const header = document.querySelector('header.header')
	const links = document.querySelectorAll('[data-goto]')
	if (links.length > 0) {
		links.forEach((link) => {
			link.addEventListener('click', onLinkClick)
		})

		function onLinkClick(e) {
			e.preventDefault()
			const link = e.target
			// Закриваємо mobile меню, якщо воно відкрите
			document.documentElement.classList.contains('menu-open') ? menuClose() : null
			// Приховуємо header, при переході на секції, що ініціюють скрол вверх
			// (за замовчуванням, при скролі вверх, клас _header-show не зникає)
			if (!document.documentElement.classList.contains('menu-open')) {
				setTimeout(
					() => {
						header.classList.remove('_header-show')
					},
					isMobileWidth() ? 1000 : 2000
				)
			}
			// Визначення висоти недокручування, якщо наявний атрибут data-goto-top="some number" (за замовчуванням 0)
			const offsetTop = link.dataset.gotoTop ? parseInt(link.dataset.gotoTop) : 0

			// Визначення висоти header, якщо наявний атрибут data-goto-header (за замовчуванням 0)
			let headerItemHeight = link.hasAttribute('data-goto-header') ? true : 0
			if (headerItemHeight) {
				// headerItemHeight = header.offsetHeight
				headerItemHeight = header.clientHeight
			}

			if (link.dataset.goto && document.querySelector(link.dataset.goto)) {
				const gotoBlock = document.querySelector(link.dataset.goto)
				const gotoBlockValue = gotoBlock.getBoundingClientRect().top + window.scrollY - offsetTop - headerItemHeight

				if (typeof SmoothScroll !== 'undefined') {
					// Прокручування з використанням доповнення
					let options = {
						speedAsDuration: true,
						speed: 1000,
						// header: 'header.header',
						offset: offsetTop,
						easing: 'easeOutQuad',
					}
					new SmoothScroll().animateScroll(gotoBlock, '', options)
				} else {
					// Прокручування стандартними засобами
					window.scrollTo({
						top: gotoBlockValue,
						behavior: 'smooth',
					})
					// Мій варіант)
					// mySmoothScroll(gotoBlockValue)
				}
			}
		}
	}
}
// ============================================================================================================================================================================================================================================================================================================================================================================================

// function mySmoothScroll(top) {
// 	const speed = 30
// 	const scrollTop = window.scrollY
// 	let position = scrollTop
// 	let actualTop = top

// 	function scrollDown() {
// 		position += speed
// 		actualTop -= speed
// 		window.scrollTo(0, position)

// 		if (actualTop >= scrollTop) {
// 			requestAnimationFrame(scrollDown)
// 		}
// 	}
// 	function scrollUp() {
// 		position -= speed
// 		actualTop += speed
// 		window.scrollTo(0, position)

// 		if (actualTop <= scrollTop) {
// 			requestAnimationFrame(scrollUp)
// 		}
// 	}
// 	actualTop >= scrollTop ? requestAnimationFrame(scrollDown) : requestAnimationFrame(scrollUp)
// }

// ============================================================================================================================================================================================================================================================================================================================================================================================

// Підсвітка активного пункту меню при скролі

// ============================================================================================================================================================================================================================================================================================================================================================================================
export function highlightingActiveMenuItem() {
	let isActiveLink = false
	const links = document.querySelectorAll('.menu__link')

	const observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				// console.log('entry:', entry)
				if (entry.isIntersecting) {
					links.forEach((link) => {
						let id = link.getAttribute('href').replace('#', '')
						if (id === entry.target.id) {
							link.classList.add('_active') // Клас '_active' додано до ссилки
							isActiveLink = true
							// console.log("IntersectionObserver додав клас '_active'")
							entry.target.classList.add('_animate') // Клас '_animate' додано секції
						} else {
							link.classList.remove('_active')
						}
					})
				} else {
				}
			})
		},
		{
			threshold: 0.6,
		}
	)
	document.querySelectorAll('section').forEach((section) => {
		observer.observe(section)
	})
	// При завантаженні сторінки на секції, яку не відслідковує IntersectionObserver
	// Активним робим перший пункт меню
	if (!isActiveLink) {
		// console.log('Немає активної секції. Клас _active додано до першого пункту меню.')
		links[0].classList.add('_active')
	}
}
// ============================================================================================================================================================================================================================================================================================================================================================================================
// Функція 'Динамічне коло'
function dinamicCircle(delay = 3000) {
	const icons = document.querySelectorAll('.includes__icon')
	// console.log('icons', icons)
	icons.forEach((icon, i) => {
		setInterval(() => {
			addColor(icon, i)
			removeColor(icon, i + 1)
		}, (icons.length + 1) * delay)
	})
	function addColor(icon, i) {
		setTimeout(() => {
			icon.classList.add('circle')
		}, i * delay)
	}
	function removeColor(icon, i) {
		setTimeout(() => {
			icon.classList.remove('circle')
		}, i * delay)
	}
}
// ============================================================================================================================================================================================================================================================================================================================================================================================
// Функція 'isMobileWidth'
function isMobileWidth() {
	return window.innerWidth < 767.98
}
// ============================================================================================================================================================================================================================================================================================================================================================================================
// Запуск всіх функцій
window.addEventListener('load', function () {
	highlightingActiveMenuItem()
	gotoSection()
	dinamicCircle()
	magicLineMenu()
})
// ============================================================================================================================================================================================================================================================================================================================================================================================
