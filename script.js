// 1. CONFIGURAÇÃO
const SUPABASE_URL = 'https://wijpbonbzngdglkeqvjy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpanBib25iem5nZGdsa2Vxdmp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MDQ1MzUsImV4cCI6MjA5MjE4MDUzNX0.FeIP_il0g4mvijP0kVGqsXRZ3dpGq8CGU9bfJNWwENQ'; 

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// === TODAS AS 11 QUESTÕES ===
const questions = [
    { 
        q: "Um ataque que retira o sistema de vendas do ar, impedindo o trabalho, ataca diretamente qual pilar da tríade CID?", 
        options: ["Confidencialidade", "Integridade", "Disponibilidade", "Accountability"], 
        correct: 2,
        info: "Disponibilidade garante que os sistemas estejam acessíveis quando necessários."
    },
    { 
        q: "Se uma alteração não autorizada é feita em uma planilha de pagamentos, qual princípio de segurança foi violado?", 
        options: ["Disponibilidade", "Confidencialidade", "Integridade", "Autenticidade"], 
        correct: 2,
        info: "Integridade garante que a informação não seja alterada de forma indevida."
    },
    { 
        q: "Ao deixar o computador desbloqueado, por que você assume um risco profissional alto?", 
        options: ["Porque o PC pode entrar em modo de suspensão", "Porque qualquer ação feita na sua conta será legalmente atribuída a você", "Porque gasta mais energia elétrica", "Porque o Windows pode travar"], 
        correct: 1,
        info: "O bloqueio (Win+L) garante a Accountability (responsabilidade pelas ações)."
    },
    { 
        q: "Um suposto gestor solicita, via WhatsApp, que você ignore um fluxo de aprovação por ser 'urgente'. Qual a conduta correta?", 
        options: ["Atender prontamente para não travar a operação", "Pausar e validar por canal oficial, pois a urgência é isca para erro", "Pedir para um colega fazer no seu lugar", "Ignorar e não falar nada"], 
        correct: 1,
        info: "A urgência artificial é uma técnica clássica de manipulação para contornar protocolos."
    },
    { 
        q: "Você encontrou uma ferramenta online gratuita que facilita muito seu trabalho. O que deve fazer antes de usá-la com dados da empresa?", 
        options: ["Usar apenas se for em aba anônima", "Testar com dados reais para ver se funciona", "Validar com a TI, para evitar o risco de Shadow IT", "Usar desde que não conte para ninguém"], 
        correct: 2,
        info: "O uso de ferramentas não homologadas (Shadow IT) gera riscos críticos de vazamento de dados."
    },
    { 
        q: "Qual dessas senhas segue a recomendação atual do Padrão NIST (Passphrase) para máxima segurança?", 
        options: ["Admin@123", "Mudar#2024", "Cadeira-Gato-Cafe-Vento-99", "S3nh4!F0rt3"], 
        correct: 2,
        info: "O NIST recomenda frases longas (Passphrases), pois o comprimento é mais seguro que a complexidade de símbolos."
    },
    { 
        q: "Sobre a política de troca de senhas, qual a orientação moderna apresentada?", 
        options: ["Trocar obrigatoriamente a cada 30 dias", "Trocar apenas se houver suspeita de vazamento ou comprometimento", "Nunca trocar a senha para não esquecer", "Trocar apenas quando o suporte solicitar"], 
        correct: 1,
        info: "Trocas forçadas geram senhas previsíveis. Mude apenas se houver risco real."
    },
    { 
        q: "Onde seus arquivos de trabalho devem estar para que a empresa consiga recuperá-los em caso de quebra do seu hardware?", 
        options: ["Na pasta 'Documentos' do seu C:", "Na 'Área de Trabalho' para fácil acesso", "Em pastas sincronizadas no OneDrive ou SharePoint", "Em um pendrive na sua gaveta"], 
        correct: 2,
        info: "Arquivos salvos localmente (Área de Trabalho) não entram no backup automático da empresa."
    },
    { 
        q: "Você acabou de imprimir um relatório com dados sensíveis, mas a reunião foi adiada. O que fazer?", 
        options: ["Deixar o papel na bandeja da impressora", "Guardar em cima da mesa para a próxima reunião", "Retirar e guardar em local seguro ou destruir se não for usar", "Pedir para a limpeza descartar no lixo comum"], 
        correct: 2,
        info: "A 'Política de Mesa Limpa' protege informações físicas contra acessos indevidos."
    },
    { 
        q: "Você recebe um e-mail de um parceiro conhecido com um link inesperado e tom de urgência. Como agir diante dessa 'quebra de padrão'?", 
        options: ["Clicar logo para ver se é algo importante", "Validar a veracidade por outro canal oficial (telefone ou chat) antes de clicar", "Responder o e-mail perguntando se é seguro", "Ignorar e apagar o e-mail sem avisar ninguém"], 
        correct: 1,
        info: "Links inesperados, mesmo de conhecidos, podem indicar contas invadidas. Sempre valide por outro canal."
    },
    { 
        q: "Qual o maior risco de conectar um pendrive encontrado no pátio da empresa no seu computador corporativo?", 
        options: ["O pendrive estar cheio e travar o PC", "Comprometer toda a rede da empresa com um software malicioso", "Perder os arquivos que estão no pendrive", "O Windows não reconhecer o dispositivo"], 
        correct: 1,
        info: "Dispositivos desconhecidos são vetores principais para entrada de Ransomwares e vírus na rede."
    }
];

let currentIndex = 0;
let answers = [];
let deviceID = "";

async function init() {
    getOrSetDeviceID();
    
    try {
        const { data, error } = await supabaseClient
            .from('questionario_resiliencia')
            .select('acertos, perguntas_erradas')
            .eq('device_id', deviceID)
            .maybeSingle();

        if (data) {
            // Se já respondeu, reconstrói o array de respostas para a revisão
            // Aqui marcamos como -1 o que ele errou (apenas para exibição)
            mostrarResultadoFinal(data.acertos, true, data.perguntas_erradas);
            return;
        }
    } catch (e) { console.error(e); }

    renderQuestion();
    await fetchGlobalStats();
}

function getOrSetDeviceID() {
    deviceID = localStorage.getItem('usaflex_uuid');
    if (!deviceID) {
        deviceID = 'id-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('usaflex_uuid', deviceID);
    }
}

function renderQuestion() {
    const container = document.getElementById('question-area');
    const q = questions[currentIndex];
    
    const progressFill = document.getElementById('progress-bar');
    if (progressFill) {
        const progress = (currentIndex / questions.length) * 100;
        progressFill.style.width = `${progress}%`;
    }

    container.innerHTML = `
        <p style="color:#a68966; font-weight:bold; margin-bottom:5px;">Questão ${currentIndex + 1} de ${questions.length}</p>
        <h2 style="font-size: 1.4rem; line-height: 1.3;">${q.q}</h2>
        <div class="options-group" style="display: flex; flex-direction: column; gap: 10px; margin-top: 15px;">
            ${q.options.map((opt, i) => `
                <div class="option-card" onclick="selectOpt(${i})" style="padding: 12px; border: 1px solid #ddd; border-radius: 8px; cursor: pointer; transition: 0.3s;">
                    ${opt}
                </div>
            `).join('')}
        </div>
    `;
}

window.selectOpt = (index) => {
    answers[currentIndex] = index;
    const cards = document.querySelectorAll('.option-card');
    cards.forEach(c => {
        c.style.backgroundColor = 'white';
        c.style.borderColor = '#ddd';
        c.style.color = 'black';
    });
    cards[index].style.backgroundColor = '#a68966';
    cards[index].style.borderColor = '#a68966';
    cards[index].style.color = 'white';
};

document.getElementById('next-btn').addEventListener('click', async () => {
    if (answers[currentIndex] === undefined) return alert("Por favor, selecione uma opção!");

    if (currentIndex < questions.length - 1) {
        currentIndex++;
        renderQuestion();
    } else {
        await finishQuiz();
    }
});

async function finishQuiz() {
    let hits = 0;
    let missedIndices = [];

    questions.forEach((q, i) => {
        if (answers[i] === q.correct) hits++;
        else missedIndices.push(i);
    });

    try {
        const { error } = await supabaseClient.from('questionario_resiliencia').insert([{
            device_id: deviceID,
            acertos: hits,
            erros: questions.length - hits,
            perguntas_erradas: missedIndices
        }]);

        if (error) {
            if (error.code === '23505' || error.message.includes('unique_device_id')) {
                alert("Você já participou deste questionário!");
                window.location.reload();
                return;
            }
            throw error;
        }

        mostrarResultadoFinal(hits, false, missedIndices);
        
    } catch (err) {
        console.error(err);
        alert("Erro ao salvar. Verifique a conexão.");
    }
}

function mostrarResultadoFinal(hits, jaRespondeu, missedIndices) {
    document.getElementById('quiz-flow').classList.add('hidden');
    document.getElementById('result-area').classList.remove('hidden');
    
    const msgArea = document.getElementById('user-score-msg');
    msgArea.innerHTML = jaRespondeu ? 
        `<strong>Aviso:</strong> Você já participou. Sua nota foi ${hits}/${questions.length}.` : 
        `Parabéns! Você acertou ${hits} de ${questions.length} questões.`;

    renderReview(missedIndices);
    fetchGlobalStats();
}

// NOVA FUNÇÃO: Renderiza a revisão de erros
function renderReview(missedIndices) {
    const container = document.getElementById('result-area');
    
    // Cria um container para a revisão se não existir
    let reviewDiv = document.getElementById('review-box');
    if (!reviewDiv) {
        reviewDiv = document.createElement('div');
        reviewDiv.id = 'review-box';
        reviewDiv.style.marginTop = '20px';
        reviewDiv.style.textAlign = 'left';
        container.appendChild(reviewDiv);
    }

    if (!missedIndices || missedIndices.length === 0) {
        reviewDiv.innerHTML = "<h3 style='color: green;'>⭐ Desempenho Perfeito! Você domina o assunto.</h3>";
        return;
    }

    let html = "<h3>📚 Revisão de Erros</h3>";
    missedIndices.forEach(idx => {
        const q = questions[idx];
        html += `
            <div style="background: #fff5f5; padding: 15px; border-left: 4px solid #e74c3c; margin-bottom: 10px; border-radius: 4px;">
                <p style="font-weight: bold; margin: 0;">${q.q}</p>
                <p style="color: #e74c3c; font-size: 0.9rem; margin: 5px 0;">Sua resposta estava incorreta.</p>
                <p style="color: #27ae60; font-weight: bold; margin: 0;">Resposta correta: ${q.options[q.correct]}</p>
                <p style="font-size: 0.85rem; color: #661; font-style: italic; margin-top: 5px;">💡 Por que? ${q.info}</p>
            </div>
        `;
    });
    reviewDiv.innerHTML = html;
}

async function fetchGlobalStats() {
    try {
        const { data, error } = await supabaseClient.from('questionario_resiliencia').select('*');
        if (error) throw error;
        if (!data || data.length === 0) return;

        const totalUsers = data.length;
        const totalHits = data.reduce((sum, row) => sum + row.acertos, 0);
        const accuracy = ((totalHits / (totalUsers * questions.length)) * 100).toFixed(1);

        document.getElementById('total-participants').innerText = totalUsers;
        document.getElementById('global-accuracy').innerText = accuracy + '%';
        
        const errorElem = document.getElementById('global-errors');
        if (errorElem) errorElem.innerText = (100 - accuracy).toFixed(1) + '%';
    } catch (err) { console.error(err); }
}

init();