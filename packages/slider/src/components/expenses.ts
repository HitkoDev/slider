import style from './expenses.scss'
import { Slider, SliderValue } from './slider'

/**
 * Demo expenses component
 */
export class Expenses extends HTMLElement {

    static get observedAttributes() {
        return [
            'title',
            'currency'
        ]
    }

    protected readonly root: ShadowRoot
    protected readonly costsWrapper: HTMLDivElement
    protected readonly sliderWrapper: HTMLDivElement
    protected readonly slotEl: HTMLSlotElement
    protected readonly titleEl: HTMLLabelElement
    protected readonly mutationObserver: MutationObserver

    private readonly childrenMap = new Map<Slider, {
        listener: (event: CustomEvent<SliderValue>) => void
        wrapper: HTMLDivElement
        currency: HTMLSpanElement
    }>()

    protected readonly state = new Proxy({
        title: 'Adjust dial to enter expenses',
        currency: '$'
    }, {
        set: <T>(target: T, key: keyof T, value: any) => {
            if (target[key] != value) {
                target[key] = value
                if (key == 'title')
                    this.updateTitle()

                if (key == 'currency')
                    this.updateCurrency()
            }
            return true
        }
    })

    set title(val: string) {
        if (val != this.state.title) {
            this.state.title = val
            this.setAttribute('title', `${val}`)
        }
    }
    get title() {
        return this.state.title
    }

    set currency(val: string) {
        if (val != this.state.currency) {
            this.state.currency = val
            this.setAttribute('currency', `${val}`)
        }
    }
    get currency() {
        return this.state.currency
    }

    constructor() {
        super()
        this.root = this.attachShadow({
            mode: 'open'
        })
        const styleEl = document.createElement('style')
        styleEl.innerHTML = style[0][1]
        this.root.appendChild(styleEl)

        this.costsWrapper = document.createElement('div')
        this.costsWrapper.classList.add(style.locals.costs)
        this.root.appendChild(this.costsWrapper)

        this.sliderWrapper = document.createElement('div')
        this.sliderWrapper.classList.add(style.locals.sliders)
        this.root.appendChild(this.sliderWrapper)

        this.slotEl = document.createElement('slot')
        this.sliderWrapper.appendChild(this.slotEl)

        this.titleEl = document.createElement('label')
        this.titleEl.classList.add(style.locals['main-label'])
        this.sliderWrapper.appendChild(this.titleEl)

        this.mutationObserver = new MutationObserver((_mut) => {
            this.updateChildren()
        })
        this.mutationObserver.observe(this, {
            childList: true
        })

        this.updateTitle()
        this.updateCurrency()
        this.updateChildren()
    }

    attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
        name = name.toLowerCase()
        switch (name) {
            case 'title':
            case 'currency':
                this.state[name] = newValue
        }
    }

    private updateTitle() {
        this.titleEl.innerText = this.title
    }

    private updateCurrency() {
        this.childrenMap.forEach(({ currency }) => currency.innerText = this.currency)
    }

    private updateChildren() {
        const children = Array.from<Slider>(this.querySelectorAll('tx-slider'))
        const elements = children.map(slider => {
            if (!this.childrenMap.has(slider)) {
                const wrapper = document.createElement('div')
                wrapper.classList.add(style.locals['costs-entry'])

                const value = document.createElement('div')
                value.classList.add(style.locals.value)
                wrapper.appendChild(value)

                const currency = document.createElement('span')
                currency.innerText = this.currency
                value.appendChild(currency)

                const input = document.createElement('input')
                input.type = 'number'
                input.min = `${slider.min}`
                input.max = `${slider.max}`
                input.value = `${Math.round(slider.value)}`
                input.id = `slider-${Math.random().toFixed(10).substr(2)}`
                input.addEventListener('change', (_event) => {
                    const val = parseFloat(input.value)
                    if (!Number.isNaN(val))
                        slider.value = val
                })
                value.appendChild(input)

                const label = document.createElement('label')
                label.setAttribute('for', input.id)
                wrapper.appendChild(label)

                const color = document.createElement('div')
                color.classList.add(style.locals.color)
                color.style.backgroundColor = slider.color
                label.appendChild(color)

                const title = document.createElement('span')
                title.innerText = slider.title
                label.appendChild(title)

                const listener = (event: CustomEvent<SliderValue>) => {
                    const state = event.detail
                    input.min = `${state.min}`
                    input.max = `${state.max}`
                    input.value = `${Math.round(state.value)}`

                    title.innerText = state.title
                    color.style.backgroundColor = state.color
                }
                slider.addEventListener('tx-slider-change', listener as any)
                this.childrenMap.set(slider, {
                    listener,
                    wrapper,
                    currency
                })
            }
            // tslint:disable-next-line: no-non-null-assertion
            return this.childrenMap.get(slider)!.wrapper
        })
            // Reverse since they'll be inserted from end
            .reverse()

        const existing = Array.from(this.costsWrapper.children)
        const updated = new Set<Element>(elements)

        existing
            .filter(el => !updated.has(el))
            .forEach(el => el.parentElement?.removeChild(el))

        elements
            .forEach((el, i) => {
                if (i)
                    this.costsWrapper.insertBefore(el, elements[i - 1])
                else
                    this.costsWrapper.appendChild(el)
            })
    }
}

customElements.define('tx-expenses', Expenses)
