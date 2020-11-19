import style from './container.scss'
import { Slider, SLIDER_WIDTH } from './slider'

const STEP = Math.round(SLIDER_WIDTH * 1.55555)

/**
 * Responsive container for one or more sliders
 *
 * Ensures there's no overlap and every slider is visible
 */
export class Container extends HTMLElement {

    static get observedAttributes() {
        return [
            'radius'
        ]
    }

    protected readonly root: ShadowRoot
    protected readonly slotEl: HTMLSlotElement
    protected readonly wrapper: HTMLDivElement
    protected readonly slidersWrapper: HTMLDivElement
    protected readonly mutationObserver: MutationObserver
    protected readonly resizeObserver: ResizeObserver

    protected readonly state = new Proxy({
        radius: null as number | null
    }, {
        set: <T>(target: T, key: keyof T, value: any) => {
            if (target[key] != value) {
                target[key] = value
                if (key == 'radius')
                    this.updateSizes()
            }
            return true
        }
    })

    /**
     * Maximum slider radius
     *
     * If null, adapts to container / CSS width
     */
    set radius(val: number | null) {
        if (val != this.state.radius) {
            this.state.radius = val
            this.setAttribute('radius', `${val}`)
        }
    }
    get radius() {
        return this.state.radius
    }

    constructor() {
        super()
        this.root = this.attachShadow({
            mode: 'open'
        })
        const styleEl = document.createElement('style')
        styleEl.innerHTML = style[0][1]
        this.root.appendChild(styleEl)

        this.wrapper = document.createElement('div')
        this.wrapper.classList.add(style.locals.wrapper)
        this.root.appendChild(this.wrapper)

        this.slidersWrapper = document.createElement('div')
        this.slidersWrapper.classList.add(style.locals.sliders)
        this.wrapper.appendChild(this.slidersWrapper)
        this.slotEl = document.createElement('slot')
        this.slidersWrapper.appendChild(this.slotEl)

        this.mutationObserver = new MutationObserver((_mut) => {
            this.updateSizes()
        })
        this.mutationObserver.observe(this, {
            childList: true
        })

        this.resizeObserver = new ResizeObserver((_res) => {
            this.updateSizes()
        })
        this.resizeObserver.observe(this)
    }

    attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
        name = name.toLowerCase()
        switch (name) {
            case 'radius':
                const val = parseFloat(newValue)
                this.state[name] = !Number.isNaN(val)
                    ? val
                    : null
                break
        }
    }

    /**
     * Update radiusese of child slider elements
     */
    private updateSizes() {
        let radius = Math.min(this.radius ?? Number.MAX_VALUE, this.getBoundingClientRect().width / 2)
        const children = Array.from<Slider>(this.querySelectorAll('tx-slider'))
        if (!children.length) {
            this.slidersWrapper.style.width = ``
            this.slidersWrapper.style.height = ``
            return
        }

        radius = Math.max(radius, STEP * children.length)
        this.slidersWrapper.style.width = `${2 * radius}px`
        this.slidersWrapper.style.height = `${2 * radius}px`
        let r = radius
        for (const child of children) {
            child.radius = r
            r -= STEP
        }
    }
}

customElements.define('tx-container', Container)
