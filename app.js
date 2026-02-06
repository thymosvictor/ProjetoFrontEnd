const baseURL = "http://localhost:8081/produtos";

const productForm = document.getElementById("productForm");
const productTable = document.getElementById("productTable");

// Variável para controlar edição
let editingId = null;

// Evento do formulário
productForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await createOrUpdateProduct();
});

// Função para listar produtos
async function getProducts() {
    try {
        const res = await fetch(baseURL);
        if (!res.ok) throw new Error("Erro ao buscar produtos");
        const products = await res.json();

        // Limpa tabela antes de renderizar
        productTable.innerHTML = "";

        products.forEach(p => {
            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${p.id}</td>
                <td>${p.nome}</td>
                <td>${p.descricao || ''}</td>
                <td>${p.preco.toFixed(2)}</td>
                <td>${p.status}</td>
                <td>
                    <button class="edit">Editar</button>
                    <button class="delete">Deletar</button>
                </td>
            `;

            productTable.appendChild(tr);

            // Botão editar
            tr.querySelector(".edit").addEventListener("click", () => {
                editingId = p.id;
                document.getElementById("nome").value = p.nome;
                document.getElementById("descricao").value = p.descricao || '';
                document.getElementById("preco").value = p.preco;
                productForm.querySelector("button").textContent = "Atualizar Produto";
            });

            // Botão deletar
            tr.querySelector(".delete").addEventListener("click", () => deleteProduct(p.id));
        });
    } catch (err) {
        alert(err);
    }
}

// Função para criar ou atualizar produto
async function createOrUpdateProduct() {
    const nome = document.getElementById("nome").value.trim();
    const descricao = document.getElementById("descricao").value.trim();
    const preco = parseFloat(document.getElementById("preco").value);

    if (!nome || preco <= 0) {
        alert("Nome e preço são obrigatórios e válidos!");
        return;
    }

    const productData = { nome, descricao, preco };

    try {
        if (editingId) {
            // Atualiza produto existente
            const res = await fetch(`${baseURL}/${editingId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData)
            });
            if (!res.ok) throw new Error("Falha ao atualizar produto");
            editingId = null;
            productForm.querySelector("button").textContent = "Adicionar Produto";
        } else {
            // Cria produto novo
            const res = await fetch(baseURL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(productData)
            });
            if (!res.ok) throw new Error("Falha ao cadastrar produto");
        }

        productForm.reset();
        getProducts();
    } catch (err) {
        alert(err);
    }
}

// Função para deletar produto
async function deleteProduct(id) {
    if (!confirm("Tem certeza que deseja deletar este produto?")) return;

    try {
        const res = await fetch(`${baseURL}/${id}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Falha ao deletar produto");
        getProducts();
    } catch (err) {
        alert(err);
    }
}

// Inicializa tabela ao carregar a página
getProducts();
