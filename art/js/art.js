document.addEventListener('DOMContentLoaded', () => {
    const imagesDiv = document.getElementById('images');
    const submitButton = document.getElementById('submit-vote');
    let captchaToken = '';

    const imageUrls = {
        'Alatauro': 'img/contest/alatauro.jpg',
        'Alsoo Guerreiro Preguiçoso': 'img/contest/alsoo_guerreiro_preguiçoso.jpg',
        'Antaris a Feiticeira': 'img/contest/antaris_a_feiticeira.jpg',
        'Tormenta': 'img/contest/tormenta.jpg',
        'Athena': 'img/contest/athena.jpg',
        'Bagos Senhor das Tempestades': 'img/contest/bagos_senhor_das_tempestades.jpg',
        'Bebe Zumbi': 'img/contest/bebe_zumbi.jpg',
        'Berian Passo Silencioso': 'img/contest/berian_passo_silencioso.jpg',
        'Calango Caçador Alado': 'img/contest/calango_caçador_alado.jpg',
        'Cavaleiro da Lua': 'img/contest/cavaleiro_da_lua.jpg',
        'Consumador de Carne': 'img/contest/consumador_de_carne.jpg',
        'Crot': 'img/contest/crot.jpg',
        'Dealer Mate': 'img/contest/dealer_mate.jpg',
        'Fase de Crescimento': 'img/contest/fase_de_crescimento.jpg',
        'Frogminator': 'img/contest/frogminator.jpg',
        'Galderio': 'img/contest/galderio.jpg',
        'Ingvar': 'img/contest/ingvar.jpg',
        'Laio the Ki Sword': 'img/contest/laio_the_ki_sword.jpg',
        'Migimaru': 'img/contest/migimaru.jpg',
        'Nekrolord': 'img/contest/nekrolord.jpg',
        'Nyalanya': 'img/contest/nyalanya.jpg',
        'Pinguim': 'img/contest/pinguim.jpg',
        'Racckief': 'img/contest/racckief.jpg',
        'Sena a Univelha': 'img/contest/sena_a_univelha.jpg',
        'Serpia': 'img/contest/serpia.jpg',
        'Skullfusion': 'img/contest/skullfusion.jpg',
        'Tomokio a Exilada': 'img/contest/tomokio_a_exilada.jpg',
        'Veneedle': 'img/contest/veneedle.jpg',
        'Volfya o Temente': 'img/contest/volfya_o_temente.jpg',
        'Vru Tata': 'img/contest/vru_tata.jpg'
    };

    let selectedImages = new Set();

    // Populate the image grid with images
    Object.entries(imageUrls).forEach(([name, url], index) => {
        const container = document.createElement('div');
        container.className = 'image-container';

        const img = document.createElement('img');
        img.src = url;
        img.dataset.index = index;
        container.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleSelectImage(index, container);
        });
        container.appendChild(img);

        const viewBtn = document.createElement('button');
        viewBtn.className = 'view-btn';
        viewBtn.innerHTML = '<i class="fa fa-eye"></i> Zoom';
        viewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openModal(url);
        });
        container.appendChild(viewBtn);

        const title = document.createElement('div');
        title.className = 'image-title';
        title.textContent = name;
        container.appendChild(title);

        imagesDiv.appendChild(container);
    });

    function toggleSelectImage(index, containerElement) {
        if (selectedImages.has(index)) {
            selectedImages.delete(index);
            containerElement.classList.remove('selected');
        } else if (selectedImages.size < 3) {
            selectedImages.add(index);
            containerElement.classList.add('selected');
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Selection Limit',
                text: 'You can only select up to 3 images.',
                background: '#1e1e1e',
                color: '#ffffff',
                iconColor: '#e74c3c'
            });
        }
    }

    function openModal(imageUrl) {
        const modal = document.getElementById('image-modal');
        const modalImg = document.getElementById('modal-image');
        const closeButton = document.querySelector('.close');

        modal.style.display = "flex";
        modalImg.src = imageUrl;
        modalImg.style.maxHeight = "90vh";
        modalImg.style.objectFit = "contain";
        modal.addEventListener('click', closeModalOnClick);
    }

    function closeModalOnClick(event) {
        if (event.target === event.currentTarget) {
            closeModal();
        }
    }

    window.closeModal = function () {
        const modal = document.getElementById('image-modal');
        const closeButton = document.querySelector('.closeButton');
        modal.style.display = "none";
        closeButton.style.display = 'none';
        modal.removeEventListener('click', closeModalOnClick);
    };

    window.storeCaptchaToken = function (token) {
        captchaToken = token;
    };

    submitButton.addEventListener('click', async () => {
        if (selectedImages.size !== 3) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Selection',
                text: 'You must select exactly 3 images.',
                background: '#1e1e1e',
                color: '#ffffff',
                iconColor: '#e74c3c'
            });
            return;
        }

        const selectedUrls = Array.from(selectedImages).map(index => {
            const imageName = Object.keys(imageUrls)[index];
            return {
                name: imageName,
                url: imageUrls[imageName]
            };
        });

        if (!captchaToken) {
            Swal.fire({
                icon: 'error',
                title: 'CAPTCHA Error',
                text: 'CAPTCHA verification failed. Please try again.',
                background: '#1e1e1e',
                color: '#ffffff',
                iconColor: '#e74c3c'
            });
            return;
        }

        try {
            const response = await fetch('https://voting.contact6132.workers.dev/submit-vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ selectedImages: selectedUrls, captchaToken: captchaToken })
            });

            if (response.ok) {
                const result = await response.json();
                Swal.fire({
                    icon: 'success',
                    title: 'Vote Submitted',
                    text: result.message,
                    background: '#1e1e1e',
                    color: '#ffffff',
                    iconColor: '#27ae60'
                });
                submitButton.disabled = true;
            } else {
                const result = await response.json();
                Swal.fire({
                    icon: 'error',
                    title: 'Vote Submission Error',
                    text: result.message || 'Error submitting vote. Please try again later.',
                    background: '#1e1e1e',
                    color: '#ffffff',
                    iconColor: '#e74c3c'
                });
            }
        } catch (error) {
            console.error('Error submitting vote:', error);
            Swal.fire({
                icon: 'error',
                title: 'Submission Error',
                text: 'Error submitting vote. Please try again later.',
                background: '#1e1e1e',
                color: '#ffffff',
                iconColor: '#e74c3c'
            });
        }
    });
});
