const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home', 'education', 'awards', 'experience', 'publications', 'academic', 'media'];
const languages = ['en', 'zh-CN', 'zh-TW', 'fr'];
const default_language = 'en';
const ui_translations = {
    en: { nav: { home: 'HOME', education: 'EDUCATION', awards: 'AWARDS', experience: 'EXPERIENCE', publications: 'RESEARCH', academic: 'ACADEMIC', photographing: 'PHOTOGRAPHY', media: 'MEDIA' }, footer: { github: 'Github', license: 'License' }, switchLanguage: 'Switch language' },
    'zh-CN': { nav: { home: '首页', education: '教育经历', awards: '获奖经历', experience: '工作经历', publications: '研究', academic: '学术活动', photographing: '摄影作品', media: '媒体报道' }, footer: { github: 'Github', license: '许可证' }, switchLanguage: '切换语言' },
    'zh-TW': { nav: { home: '首頁', education: '教育經歷', awards: '獲獎經歷', experience: '工作經歷', publications: '研究', academic: '學術活動', photographing: '攝影作品', media: '媒體報導' }, footer: { github: 'Github', license: '授權條款' }, switchLanguage: '切換語言' },
    fr: { nav: { home: 'ACCUEIL', education: 'FORMATION', awards: 'DISTINCTIONS', experience: 'EXPÉRIENCE', publications: 'RECHERCHE', academic: 'ACTIVITÉS ACADÉMIQUES', photographing: 'PHOTOGRAPHIE', media: 'MÉDIAS' }, footer: { github: 'Github', license: 'Licence' }, switchLanguage: 'Changer de langue' }
};
const requested_language = new URLSearchParams(window.location.search).get('lang');
let current_language = requested_language || localStorage.getItem('homepage-language') || default_language;
if (!languages.includes(current_language)) current_language = default_language;

function getLocalizedPath(name) {
    return current_language === default_language ? content_dir + name : content_dir + current_language + '/' + name;
}

function getTranslation(key) {
    return key.split('.').reduce((value, part) => value && value[part], ui_translations[current_language]);
}

function applyLanguageUi() {
    document.documentElement.lang = current_language;
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const translation = getTranslation(element.dataset.i18n);
        if (translation) element.textContent = translation;
    });
    const languageButton = document.getElementById('languageButton');
    languageButton.textContent = current_language === 'zh-CN' ? '简中' : current_language === 'zh-TW' ? '繁中' : current_language.toUpperCase();
    languageButton.setAttribute('aria-label', ui_translations[current_language].switchLanguage);
    document.querySelectorAll('.language-option').forEach(option => {
        option.classList.toggle('active', option.dataset.language === current_language);
    });
}

function loadLanguage() {
    applyLanguageUi();
    const configRequest = fetch(getLocalizedPath(config_file)).then(response => {
        if (!response.ok) throw new Error(`Unable to load ${getLocalizedPath(config_file)} (${response.status})`);
        return response.text();
    });
    configRequest.then(text => {
        const yml = jsyaml.load(text);
        Object.keys(yml).forEach(key => {
            const element = document.getElementById(key);
            if (element) element.innerHTML = yml[key];
        });
    }).catch(error => console.log(error));

    section_names.forEach(name => {
        fetch(getLocalizedPath(name + '.md'))
            .then(response => {
                if (!response.ok) throw new Error(`Unable to load ${getLocalizedPath(name + '.md')} (${response.status})`);
                return response.text();
            })
            .then(markdown => {
                const container = document.getElementById(name + '-md');
                container.innerHTML = marked.parse(markdown);
                if (name === 'publications') makePublicationsCollapsible(container);
                return MathJax.typesetPromise([container]);
            })
            .catch(error => console.log(error));
    });
}

function makePublicationsCollapsible(container) {
    const headings = Array.from(container.querySelectorAll(':scope > h3'));

    headings.forEach(heading => {
        const details = document.createElement('details');
        const summary = document.createElement('summary');
        const content = document.createDocumentFragment();

        summary.className = 'publication-summary';
        summary.innerHTML = heading.innerHTML;
        details.appendChild(summary);

        let sibling = heading.nextSibling;
        while (sibling && sibling !== headings[headings.indexOf(heading) + 1]) {
            const nextSibling = sibling.nextSibling;
            content.appendChild(sibling);
            sibling = nextSibling;
        }

        details.appendChild(content);
        heading.replaceWith(details);
    });
}



window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });


    marked.use({ mangle: false, headerIds: false })
    document.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', () => {
            current_language = option.dataset.language;
            localStorage.setItem('homepage-language', current_language);
        });
    });
    loadLanguage();

}); 
