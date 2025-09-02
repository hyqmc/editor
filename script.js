document.addEventListener('DOMContentLoaded', () => {
    const editorContainer = document.getElementById('editor-container');
    const loadTemplateBtn = document.getElementById('loadTemplate');
    const uploadJSONInput = document.getElementById('uploadJSON');
    const downloadJSONBtn = document.getElementById('downloadJSON');
    const addCategoryBtn = document.getElementById('addCategory');

    const templateData = [
        {
            "category": "Abordagem Terapêutica",
            "type": "single",
            "description": "Selecione a abordagem teórica que guia a sessão.",
            "items": ["TCC (Terapia Cognitivo-Comportamental)", "Psicanálise", "Terapia Humanista", "Terapia Sistêmica", "Análise do Comportamento"]
        },
        {
            "category": "Recursos e Técnicas Utilizadas",
            "type": "multiple",
            "description": "Selecione os recursos ou técnicas aplicadas durante a sessão.",
            "items": [
                {
                    "main": "Recursos gráficos (desenho, escrita)",
                    "sub": ["Desenho livre", "Mandalas", "Escrita terapêutica", "Brainstorming no papel"]
                },
                "Diário de Pensamentos",
                "Exercícios de Respiração",
                "Exposição (real ou imaginária)",
                "Role-playing",
                "Técnicas de relaxamento"
            ]
        },
        {
            "category": "Estado Inicial do Paciente",
            "type": "multiple",
            "description": "Marque as características observadas na chegada do paciente.",
            "items": ["Ansioso", "Calmo", "Agitado", "Triste", "Comunicação clara", "Distraído", "Com pouca expressão"]
        },
        {
            "category": "Observações da Sessão",
            "type": "textarea",
            "description": "Anote aqui observações detalhadas sobre o andamento da sessão, o comportamento do paciente, ou qualquer ponto relevante.",
            "items": []
        }
    ];

    loadTemplateBtn.addEventListener('click', () => {
        renderEditor(templateData);
    });

    uploadJSONInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                renderEditor(data);
            } catch (error) {
                alert('Erro ao carregar o arquivo. Certifique-se de que é um JSON válido.');
                console.error('Erro de parsing JSON:', error);
            }
        };
        reader.readAsText(file);
    });

    downloadJSONBtn.addEventListener('click', () => {
        const data = getEditorData();
        const dataStr = JSON.stringify(data, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'modelo_relatorio_personalizado.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });

    addCategoryBtn.addEventListener('click', () => {
        addCategoryEditor();
    });

    function renderEditor(data) {
        editorContainer.innerHTML = '';
        data.forEach(category => addCategoryEditor(category));
    }

    function addCategoryEditor(category = { category: '', type: 'multiple', description: '', items: [] }) {
        const categoryEditor = document.createElement('div');
        categoryEditor.classList.add('category-editor');

        categoryEditor.innerHTML = `
            <button class="remove-category-btn">Remover Categoria</button>
            <div class="input-group">
                <label>Nome da Categoria:</label>
                <input type="text" class="category-name" value="${category.category}">
            </div>
            <div class="input-group">
                <label>Descrição:</label>
                <textarea class="category-description">${category.description}</textarea>
            </div>
            <div class="input-group">
                <label>Tipo de Campo:</label>
                <select class="category-type">
                    <option value="multiple" ${category.type === 'multiple' ? 'selected' : ''}>Múltipla Escolha (Checkbox)</option>
                    <option value="single" ${category.type === 'single' ? 'selected' : ''}>Seleção Única (Radio)</option>
                    <option value="textarea" ${category.type === 'textarea' ? 'selected' : ''}>Anotação por Extenso (Campo de Texto)</option>
                </select>
            </div>
            <div class="items-editor">
                <h4>Itens da Categoria</h4>
                <div class="items-list"></div>
                <button type="button" class="add-item-btn">Adicionar Item</button>
            </div>
        `;

        const typeSelect = categoryEditor.querySelector('.category-type');
        const itemsEditor = categoryEditor.querySelector('.items-editor');
        const itemsList = categoryEditor.querySelector('.items-list');

        const updateEditorView = () => {
            if (typeSelect.value === 'textarea') {
                itemsEditor.style.display = 'none';
            } else {
                itemsEditor.style.display = 'block';
            }
        };

        typeSelect.addEventListener('change', updateEditorView);
        updateEditorView();

        category.items.forEach(item => addItemEditor(itemsList, item));

        categoryEditor.querySelector('.add-item-btn').addEventListener('click', () => {
            addItemEditor(itemsList);
        });

        categoryEditor.querySelector('.remove-category-btn').addEventListener('click', () => {
            categoryEditor.remove();
        });

        editorContainer.appendChild(categoryEditor);
        document.getElementById('editor-message').style.display = 'none';
    }

    function addItemEditor(list, item = '') {
        const itemRow = document.createElement('div');
        itemRow.classList.add('item-row');

        const itemInput = document.createElement('input');
        itemInput.type = 'text';
        itemInput.value = (typeof item === 'object' && item.main) ? item.main : item;
        itemInput.placeholder = 'Nome do item';

        const removeItemBtn = document.createElement('button');
        removeItemBtn.textContent = 'Remover';
        removeItemBtn.classList.add('remove-item-btn');
        removeItemBtn.addEventListener('click', () => {
            itemRow.remove();
        });
        
        itemRow.appendChild(itemInput);
        itemRow.appendChild(removeItemBtn);

        if (typeof item === 'object' && item.main && item.sub) {
            const addSubItemBtn = document.createElement('button');
            addSubItemBtn.textContent = 'Adicionar Sub-item';
            addSubItemBtn.classList.add('add-item-btn');
            itemRow.appendChild(addSubItemBtn);

            const subItemsSection = document.createElement('div');
            subItemsSection.classList.add('sub-items-section');
            itemRow.appendChild(subItemsSection);

            item.sub.forEach(subItem => addSubItem(subItemsSection, subItem));

            addSubItemBtn.addEventListener('click', () => addSubItem(subItemsSection));
        }

        list.appendChild(itemRow);
    }

    function addSubItem(list, subItem = '') {
        const subItemRow = document.createElement('div');
        subItemRow.classList.add('sub-item-row');

        const subItemInput = document.createElement('input');
        subItemInput.type = 'text';
        subItemInput.value = subItem;
        subItemInput.placeholder = 'Nome do sub-item';

        const removeSubItemBtn = document.createElement('button');
        removeSubItemBtn.textContent = 'Remover';
        removeSubItemBtn.classList.add('remove-item-btn');
        removeSubItemBtn.addEventListener('click', () => {
            subItemRow.remove();
        });

        subItemRow.appendChild(subItemInput);
        subItemRow.appendChild(removeSubItemBtn);
        list.appendChild(subItemRow);
    }

    function getEditorData() {
        const data = [];
        const categoryEditors = document.querySelectorAll('.category-editor');
        categoryEditors.forEach(editor => {
            const category = {};
            category.category = editor.querySelector('.category-name').value;
            category.description = editor.querySelector('.category-description').value;
            category.type = editor.querySelector('.category-type').value;

            if (category.type !== 'textarea') {
                const items = [];
                editor.querySelectorAll('.items-list > .item-row').forEach(itemRow => {
                    const itemName = itemRow.querySelector('input').value;
                    const subItemsSection = itemRow.querySelector('.sub-items-section');
                    if (subItemsSection) {
                        const subItems = Array.from(subItemsSection.querySelectorAll('input')).map(input => input.value);
                        items.push({ main: itemName, sub: subItems });
                    } else {
                        items.push(itemName);
                    }
                });
                category.items = items;
            } else {
                category.items = [];
            }
            data.push(category);
        });
        return data;
    }
});
