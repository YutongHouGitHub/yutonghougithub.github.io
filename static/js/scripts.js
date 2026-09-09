const content_dir = 'contents/'
const config_file = 'config.yml'
const section_names = ['home', 'education', 'awards', 'experience', 'publications', 'academic', 'media'];

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


    // Yaml
    fetch(content_dir + config_file)
        .then(response => response.text())
        .then(text => {
            const yml = jsyaml.load(text);
            Object.keys(yml).forEach(key => {
                try {
                    document.getElementById(key).innerHTML = yml[key];
                } catch {
                    console.log("Unknown id and value: " + key + "," + yml[key].toString())
                }

            })
        })
        .catch(error => console.log(error));


    // Marked
    marked.use({ mangle: false, headerIds: false })
    section_names.forEach((name, idx) => {
        fetch(content_dir + name + '.md')
            .then(response => response.text())
            .then(markdown => {
                const html = marked.parse(markdown);
                const container = document.getElementById(name + '-md');
                container.innerHTML = html;
                if (name === 'publications') {
                    makePublicationsCollapsible(container);
                }
            }).then(() => {
                // MathJax
                MathJax.typeset();
            })
            .catch(error => console.log(error));
    })

}); 
