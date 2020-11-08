import { instance, mock } from 'ts-mockito'

export function mockConsole() {
    const originalConsole = { ...global.console }
    const ConsoleMock = mock<Console>()
    global.console = instance(ConsoleMock)

    const restoreConsole = () => {
        global.console = originalConsole
    }
    return {
        ConsoleMock,
        restoreConsole
    }
}
