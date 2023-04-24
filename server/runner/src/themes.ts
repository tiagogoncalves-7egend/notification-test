type Theme = {
    emoji: string
    color: string
}

type Themes = {
    development: Theme
    qa: Theme
    staging: Theme
    production: Theme
}

const themes: Themes = {
    development: { emoji: '🧸', color: '#4cbb17' },
    qa: { emoji: '💉', color: '#0892d0' },
    staging: { emoji: '🥁', color: '#bc8f8f' },
    production: { emoji: '🎯', color: '#ff00ff' },
}

export default themes
