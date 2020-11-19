import style from './slider.scss'

export const SLIDER_WIDTH = 18
const SLIDER_PADDING = Math.round(SLIDER_WIDTH * 0.72222)
const INDICATOR_RADIUS = Math.round(SLIDER_WIDTH * 0.66667)

const VALUE_ATTRIBUTES = new Set<string | number | symbol>(['min', 'max', 'value', 'radius'])

let activeSlider: Slider | undefined

function endSlider(event: Event) {
    if (activeSlider) {
        activeSlider = undefined
        event.stopPropagation()
        if (event.cancelable)
            event.preventDefault()
    }
}

window.addEventListener('mouseup', endSlider)
window.addEventListener('touchend', endSlider)
window.addEventListener('touchcancel', endSlider)

window.addEventListener('mousemove', (event) => {
    if (activeSlider) {
        activeSlider.setValueFromPoint(event, true)
        event.stopPropagation()
        event.preventDefault()
    }
})

window.addEventListener('touchmove', (event) => {
    if (activeSlider) {
        activeSlider.touchListener(event)
    }
}, { passive: false })

export interface SliderValue {
    /**
     * Minimum slider value
     */
    min: number
    /**
     * Maximum slider value
     */
    max: number
    /**
     * Slider value
     */
    value: number
    /**
     * Slider radius
     */
    radius: number
    /**
     * Slider color
     */
    color: string
    /**
     * Slider title
     */
    title: string
}

/**
 * Reusable radial slider component
 */
export class Slider extends HTMLElement implements SliderValue {

    static get observedAttributes() {
        return [
            'min',
            'max',
            'value',
            'radius',
            'color',
            'title'
        ]
    }

    protected readonly root: ShadowRoot
    protected readonly svg: SVGElement
    protected readonly fillBorder: SVGPathElement
    protected readonly baseBorder: SVGCircleElement
    protected readonly clickTarget: SVGCircleElement
    protected readonly indicator: SVGCircleElement

    protected readonly state = new Proxy({
        min: 0,
        max: 100,
        value: 46,
        radius: 100,
        color: '#00bcca',
        title: 'Set value'
    } as SliderValue, {
        set: <T>(target: T, key: keyof T, value: any) => {
            if (target[key] != value) {
                target[key] = value
                if (key == 'radius')
                    this.updateRadius()

                if (key == 'color')
                    this.updateColor()

                if (key == 'title')
                    this.updateTitle()

                if (VALUE_ATTRIBUTES.has(key))
                    this.updateValue()

                this.dispatchEvent(new CustomEvent('tx-slider-change', {
                    detail: { ...target }
                }))
            }
            return true
        }
    })

    set min(val: number) {
        if (val != this.state.min) {
            this.state.min = val
            this.setAttribute('min', `${val}`)
        }
    }
    get min() {
        return this.state.min
    }

    set max(val: number) {
        if (val != this.state.max) {
            this.state.max = val
            this.setAttribute('max', `${val}`)
        }
    }
    get max() {
        return this.state.max
    }

    set value(val: number) {
        if (val != this.state.value) {
            this.state.value = val
            this.setAttribute('value', `${val}`)
        }
    }
    get value() {
        return this.state.value
    }

    set radius(val: number) {
        if (val != this.state.radius) {
            this.state.radius = val
            this.setAttribute('radius', `${val}`)
        }
    }
    get radius() {
        return this.state.radius
    }

    set color(val: string) {
        if (val != this.state.color) {
            this.state.color = val
            this.setAttribute('color', `${val}`)
        }
    }
    get color() {
        return this.state.color
    }

    set title(val: string) {
        if (val != this.state.title) {
            this.state.title = val
            this.setAttribute('title', `${val}`)
        }
    }
    get title() {
        return this.state.title
    }

    constructor(options?: Partial<SliderValue>) {
        super()
        if (options)
            this.setState(options)

        this.root = this.attachShadow({
            mode: 'open'
        })
        const styleEl = document.createElement('style')
        styleEl.innerHTML = style[0][1]
        this.root.appendChild(styleEl)

        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
        this.root.appendChild(this.svg)

        this.fillBorder = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        this.fillBorder.classList.add(style.locals.border)
        this.fillBorder.style.strokeWidth = `${SLIDER_WIDTH}px`
        this.svg.appendChild(this.fillBorder)

        this.baseBorder = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        this.baseBorder.classList.add(style.locals.border)
        this.baseBorder.style.strokeWidth = `${SLIDER_WIDTH}px`
        this.svg.appendChild(this.baseBorder)

        this.clickTarget = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        this.clickTarget.classList.add(style.locals.listener)
        this.svg.appendChild(this.clickTarget)

        this.indicator = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
        this.indicator.classList.add(style.locals.indicator)
        this.indicator.setAttribute('r', `${INDICATOR_RADIUS}`)
        this.svg.appendChild(this.indicator)

        const mouseStartListener = (event: MouseEvent) => {
            activeSlider = this
            if (event.target == this.indicator) {
                // Use current indicator position
                const rect = this.indicator.getBoundingClientRect()
                this.setValueFromPoint({ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 })
            } else {
                this.setValueFromPoint(event)
            }
            event.stopPropagation()
        }

        this.indicator.addEventListener('mousedown', mouseStartListener)
        this.indicator.addEventListener('touchstart', this.touchListener, { passive: false })
        this.indicator.addEventListener('touchmove', this.touchListener, { passive: false })

        this.clickTarget.addEventListener('mousedown', mouseStartListener)
        this.clickTarget.addEventListener('touchstart', this.touchListener, { passive: false })
        this.clickTarget.addEventListener('touchmove', this.touchListener, { passive: false })

        this.updateRadius()
        this.updateValue()
        this.updateColor()
        this.updateTitle()
    }

    readonly touchListener = (event: TouchEvent) => {
        // Find this slider's touch event
        const touch = Array.from(event.touches).find(t => t?.target == this.indicator || t?.target == this.clickTarget)
        if (touch) {
            this.setValueFromPoint({ x: touch.clientX, y: touch.clientY }, true)
            event.stopPropagation()
            if (event.cancelable)
                event.preventDefault()
        }
    }

    setState(options: Partial<SliderValue>) {
        Object.keys(options).forEach((key) => {
            const k = key as keyof SliderValue
            if (options[k] != null && options[k] != undefined)
                (this as any)[k] = options[k]
        })
    }

    /**
     * Set slider value by calculating the angle between slider centre and a point
     *
     * @param point client coordinates
     * @param preventOverflow if true, block jumps from min to max value (shoud be true when sliding, and false when clicking)
     */
    setValueFromPoint(point: { x: number, y: number }, preventOverflow = false) {
        // Get points relative to centre
        const rect = this.svg.getBoundingClientRect()
        const x = point.x - (rect.x + rect.width / 2)
        const y = point.y - (rect.y + rect.height / 2)

        // Ignore moving through centre
        if (x == 0 && y == 0)
            return

        // Get angle from points
        let a = Math.atan2(y, x) + 0.5 * Math.PI
        if (a < 0)
            a += 2 * Math.PI

        // Get relative value from angle
        let value = (a / (2 * Math.PI)) % 1

        if (preventOverflow) {
            // Prevent slider from jumping between min and max
            const { value: oldValue } = this.caclulateValueParams()
            if (oldValue < 0.25 && value > 0.75)
                value = 0
            else if (oldValue > 0.75 && value < 0.25)
                value = 1
        }

        // Set absolute value
        this.value = this.min + (this.max - this.min) * value
    }

    attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
        name = name.toLowerCase()
        switch (name) {
            case 'min':
            case 'max':
            case 'value':
            case 'radius':
                const val = parseFloat(newValue)
                if (!Number.isNaN(val))
                    this.state[name] = val
                break
            case 'color':
            case 'title':
                this.state[name] = newValue
        }
    }

    /**
     * Update rendered content with new slider radius
     */
    private updateRadius() {
        const r = this.radius
        const wh = 2 * r
        const innerR = r - SLIDER_PADDING
        const c = 2 * innerR * Math.PI
        const segments = Math.round(c / 7.5)
        const segmentW = (c / segments) - 1.5

        this.svg.setAttribute('viewbox', `0 0 ${wh} ${wh}`)
        this.svg.setAttribute('width', `${wh}`)
        this.svg.setAttribute('height', `${wh}`)

        this.baseBorder.setAttribute('cx', `${r}`)
        this.baseBorder.setAttribute('cy', `${r}`)
        this.baseBorder.setAttribute('r', `${innerR}`)
        this.baseBorder.style.strokeDasharray = `${segmentW}px 1.5px`

        this.clickTarget.setAttribute('cx', `${r}`)
        this.clickTarget.setAttribute('cy', `${r}`)
        this.clickTarget.setAttribute('r', `${innerR}`)
    }

    /**
     * Update rendered contend with new value
     */
    private updateValue() {
        const r = this.radius
        const { x, y, largeArc } = this.caclulateValueParams()

        const innerR = r - SLIDER_PADDING
        this.fillBorder.setAttribute('d', `M ${r} ${SLIDER_PADDING} A ${innerR} ${innerR} 0 ${largeArc} 1 ${x} ${y}`)

        this.indicator.setAttribute('cx', `${x}`)
        this.indicator.setAttribute('cy', `${y}`)
    }

    private updateColor() {
        this.fillBorder.style.stroke = this.color
    }

    private updateTitle() {
        this.indicator.setAttribute('titie', this.title)
        this.clickTarget.setAttribute('titie', this.title)
    }

    /**
     * Calculate values for slider render
     */
    private caclulateValueParams() {
        const r = this.radius
        const innerR = r - SLIDER_PADDING
        let value = (this.value - this.min) / (this.max - this.min)
        value = Math.min(1, Math.max(0, value))
        const angle = (2.5 * Math.PI) - (2 * Math.PI * value)

        let x = Math.cos(angle) * innerR + r
        let y = r - Math.sin(angle) * innerR
        // Ensure full arc is drawn
        if (value == 1) {
            x = r - 0.01
            y = SLIDER_PADDING
        }

        return {
            /**
             * Relative value [0,1]
             */
            value,
            /**
             * Render large or small protion of the arc
             */
            largeArc: value > 0.5 ? 1 : 0,
            /**
             * X coordinate of indicator
             */
            x,
            /**
             * Y coordinate of indicator
             */
            y
        }
    }
}

customElements.define('tx-slider', Slider)
