const form = document.getElementById('coffee-form');
const addBeverageButton = form.querySelector('.add-button');
const submitButton = form.querySelector('.submit-button');
const firstBeverageFieldset = form.querySelector('.beverage');
const modalOverlay = document.querySelector('.modal-overlay');
const modal = document.querySelector('.modal');
const modalCloseButton = modal.querySelector('.modal-close-button');
const modalContent = modal.querySelector('.modal-content');

let beverageCounter = 1;
const highlightKeywords = ["срочно", "быстрее", "побыстрее", "скорее", "поскорее", "очень нужно"];
const keywordRegex = new RegExp(`(${highlightKeywords.join('|')})`, 'gi');

function updateBeverageNumbers() {
    const allBeverages = form.querySelectorAll('.beverage');
    beverageCounter = allBeverages.length;
    allBeverages.forEach((fieldset, index) => {
        const countElement = fieldset.querySelector('.beverage-count');
        const radioButtons = fieldset.querySelectorAll('input[type="radio"]');
        const beverageSelect = fieldset.querySelector('[data-beverage-select]');
        const checkBoxes = fieldset.querySelectorAll('input[type="checkbox"]');
        const commentTextarea = fieldset.querySelector('.comment-textarea');
        const commentPreview = fieldset.querySelector('.comment-preview');
        const commentLabel = fieldset.querySelector('label[for^="comment-"]');

        const currentBeverageNumber = index + 1;

        if (countElement) {
            countElement.textContent = `Напиток №${currentBeverageNumber}`;
        }
        radioButtons.forEach(radio => {
            radio.name = `milk-${currentBeverageNumber}`;
        });
        if (beverageSelect) {
            beverageSelect.name = `beverage-type-${currentBeverageNumber}`;
        }
        checkBoxes.forEach(checkbox => {
            checkbox.name = `options-${currentBeverageNumber}`;
        });
        if (commentTextarea) {
            const newId = `comment-${currentBeverageNumber}`;
            commentTextarea.id = newId;
            commentTextarea.name = newId;
            if (commentLabel) {
                commentLabel.setAttribute('for', newId);
            }
            if (commentPreview) {
                commentPreview.dataset.previewFor = newId;
            }
        }
    });
}

function updateRemoveButtonsState() {
    const allRemoveButtons = form.querySelectorAll('.remove-beverage');
    const beveragesCount = form.querySelectorAll('.beverage').length;
    allRemoveButtons.forEach(button => {
        button.disabled = beveragesCount <= 1;
    });
}

function getPluralizedWord(number) {
    const lastDigit = number % 10;
    const lastTwoDigits = number % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) return 'напитков';
    if (lastDigit === 1) return 'напиток';
    if (lastDigit >= 2 && lastDigit <= 4) return 'напитка';
    return 'напитков';
}

function showModal() {
    modalOverlay.classList.remove('hidden');
    modal.classList.remove('hidden');
    const timeInput = modal.querySelector('#order-time');
    if (timeInput) {
        const now = new Date();
        now.setMinutes(now.getMinutes());
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        timeInput.value = `${hours}:${minutes}`;
        timeInput.classList.remove('input-error');
    }
}

function hideModal() {
    modalOverlay.classList.add('hidden');
    modal.classList.add('hidden');
    modalContent.innerHTML = '';
}

function handleAddBeverage() {
    const newBeverage = firstBeverageFieldset.cloneNode(true);
    beverageCounter++;

    const select = newBeverage.querySelector('select');
    if (select) select.selectedIndex = 0;

    const radios = newBeverage.querySelectorAll('input[type="radio"]');
    radios.forEach((radio, index) => radio.checked = index === 0);
    const checkboxes = newBeverage.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => checkbox.checked = false);

    const textarea = newBeverage.querySelector('.comment-textarea');
    const preview = newBeverage.querySelector('.comment-preview');
    if (textarea) textarea.value = '';
    if (preview) preview.innerHTML = '';

    const allBeverages = form.querySelectorAll('.beverage');
    allBeverages[allBeverages.length - 1].after(newBeverage);

    updateBeverageNumbers();
    updateRemoveButtonsState();
}

function handleRemoveBeverage(event) {
    if (event.target.classList.contains('remove-beverage')) {
        const fieldsetToRemove = event.target.closest('.beverage');
        if (fieldsetToRemove && form.querySelectorAll('.beverage').length > 1) {
            fieldsetToRemove.remove();
            updateBeverageNumbers();
            updateRemoveButtonsState();
        }
    }
}

function handleTextAreaInput(event) {
    if (event.target.classList.contains('comment-textarea')) {
        const textarea = event.target;
        const previewId = textarea.id;
        const previewDiv = form.querySelector(`.comment-preview[data-preview-for="${previewId}"]`);
        if (previewDiv) {
            let text = textarea.value;
            text = text.replace(keywordRegex, `<b>$1</b>`);
            previewDiv.innerHTML = text;
        }
    }
}

function handleSubmit(event) {
    event.preventDefault();

    const allBeverages = form.querySelectorAll('.beverage');
    const numBeverages = allBeverages.length;
    const pluralizedWord = getPluralizedWord(numBeverages);

    let modalHTML = `<h5>Вы заказали ${numBeverages} ${pluralizedWord}</h5>`;
    modalHTML += `<table class="order-table">
                    <thead>
                        <tr>
                            <th>Напиток</th>
                            <th>Молоко</th>
                            <th>Дополнительно</th>
                            <th>Пожелания</th>
                        </tr>
                    </thead>
                    <tbody>`;

    allBeverages.forEach(fieldset => {
        const beverageSelect = fieldset.querySelector('[data-beverage-select]');
        const beverageName = beverageSelect.options[beverageSelect.selectedIndex].text;

        const selectedMilkInput = fieldset.querySelector('input[type="radio"]:checked');
        const milkName = selectedMilkInput ? selectedMilkInput.dataset.milkOption || selectedMilkInput.nextElementSibling.textContent : 'не выбрано';

        const selectedOptionsInputs = fieldset.querySelectorAll('input[type="checkbox"]:checked');
        const optionsList = Array.from(selectedOptionsInputs).map(input => input.dataset.extraOption || input.nextElementSibling.textContent);
        const optionsString = optionsList.length > 0 ? optionsList.join(', ') : 'нет';

        const commentTextarea = fieldset.querySelector('.comment-textarea');
        const comment = commentTextarea ? commentTextarea.value.trim() : '';
        const commentDisplay = comment || 'нет';
        modalHTML += `<tr>
                        <td>${beverageName}</td>
                        <td>${milkName}</td>
                        <td>${optionsString}</td>
                        <td>${commentDisplay}</td>
                      </tr>`;
    });

    modalHTML += `  </tbody>
                  </table>`;

    modalHTML += `
        <div class="modal-time-section">
             <label for="order-time">Выберите время заказа:</label>
             <input type="time" id="order-time" name="order-time" required>
        </div>
        <button type="button" id="confirm-order-button" class="modal-confirm-button">Оформить</button>
    `;

    modalContent.innerHTML = modalHTML;
    showModal();
}

function handleModalClick(event) {
    if (event.target.id === 'confirm-order-button') {
        const timeInput = modal.querySelector('#order-time');
        timeInput.style.borderColor = 'red';
        if (!timeInput || !timeInput.value) {
            alert('Пожалуйста, выберите время заказа.');
            if (timeInput) timeInput.classList.add('input-error');
            return;
        }

        const selectedTime = timeInput.value;
        const now = new Date();
        const currentHours = String(now.getHours()).padStart(2, '0');
        const currentMinutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${currentHours}:${currentMinutes}`;

        if (selectedTime < currentTime) {
            alert('Мы не умеем перемещаться во времени. Выберите время позже, чем текущее');
            timeInput.classList.add('input-error');
        } else {
            timeInput.classList.remove('input-error');
            console.log('Заказ оформлен на время:', selectedTime);
            hideModal();
        }
    }
}

addBeverageButton.addEventListener('click', handleAddBeverage);
form.addEventListener('click', handleRemoveBeverage);
form.addEventListener('submit', handleSubmit);
modalCloseButton.addEventListener('click', hideModal);
modalOverlay.addEventListener('click', hideModal);

form.addEventListener('input', handleTextAreaInput);

modal.addEventListener('click', handleModalClick);


updateBeverageNumbers();
updateRemoveButtonsState();
const initialTextarea = firstBeverageFieldset.querySelector('.comment-textarea');
if (initialTextarea) {
    handleTextAreaInput({target: initialTextarea});
}