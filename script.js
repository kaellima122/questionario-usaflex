// 1. CONFIGURAÇÃO
const SUPABASE_URL = 'https://wijpbonbzngdglkeqvjy.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpanBib25iem5nZGdsa2Vxdmp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MDQ1MzUsImV4cCI6MjA5MjE4MDUzNX0.FeIP_il0g4mvijP0kVGqsXRZ3dpGq8CGU9bfJNWwENQ'; 

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// === TODAS AS 11 QUESTÕES ===
const questions = [
    { 
        q: "Um ataque que retira o sistema de vendas do ar, impedindo o trabalho, ataca diretamente qual pilar da tríade CID?", 
        options: ["Confidencialidade", "Integridade", "Disponibilidade", "Accountability"], 
        correct: 2 
    },
    { 
        q: "Se uma alteração não autorizada é feita em uma planilha de pagamentos, qual princípio de segurança foi violado?", 
        options: ["Disponibilidade", "Confidencialidade", "Integridade", "Autenticidade"], 
        correct: 2 
    },
    { 
        q: "Ao deixar o computador desbloqueado, por que você assume um risco profissional alto?", 
        options: ["Porque o PC pode entrar em modo de suspensão", "Porque qualquer ação feita na sua conta será legalmente atribuída a você", "Porque gasta mais energia elétrica", "Porque o Windows pode travar"], 
        correct: 1 
    },
    { 
        q: "Um suposto gestor solicita, via WhatsApp, que você ignore um fluxo de aprovação por ser 'urgente'. Qual a conduta correta?", 
        options: ["Atender prontamente para não travar a operação", "Pausar e validar por canal oficial, pois a urgência é isca para erro", "Pedir para um colega fazer no seu lugar", "Ignorar e não falar nada"], 
        correct: 1 
    },
    { 
        q: "Você encontrou uma ferramenta online gratuita que facilita muito seu trabalho. O que deve fazer antes de usá-la com dados da empresa?", 
        options: ["Usar apenas se for em aba anônima", "Testar com dados reais para ver se funciona", "Validar com a TI, para evitar o risco de Shadow IT", "Usar desde que não conte para ninguém"], 
        correct: 2 
    },
    { 
        q: "Qual dessas senhas segue a recomendação atual do Padrão NIST (Passphrase) para máxima segurança?", 
        options: ["Admin@123", "Mudar#2024", "Cadeira-Gato-Cafe-Vento-99", "S3nh4!F0rt3"], 
        correct: 2 
    },
    { 
        q: "Sobre a política de troca de senhas, qual a orientação moderna apresentada?", 
        options: ["Trocar obrigatoriamente a cada 30 dias", "Trocar apenas se houver suspeita de vazamento ou comprometimento", "Nunca trocar a senha para não esquecer", "Trocar apenas quando o suporte solicitar"], 
        correct: 1 
    },
    { 
        q: "Onde seus arquivos de trabalho devem estar para que a empresa consiga recuperá-los em caso de quebra do seu hardware?", 
        options: ["Na pasta 'Documentos' do seu C:", "Na 'Área de Trabalho' para fácil acesso", "Em pastas sincronizadas no OneDrive ou SharePoint", "Em um pendrive na sua gaveta"], 
        correct: 2 
    },
    { 
        q: "Você acabou de imprimir um relatório com dados sensíveis, mas a reunião foi adiada. O que fazer?", 
        options: ["Deixar o papel na bandeja da impressora", "Guardar em cima da mesa para a próxima reunião", "Retirar e guardar em local seguro ou destruir se não for usar", "Pedir para a limpeza descartar no lixo comum"], 
        correct: 2 
    },
    { 
        q: "Um e-mail com linguagem estranha e um link inesperado chega em sua caixa, vindo de um parceiro conhecido. O que isso pode ser?", 
        options: ["Uma atualização automática do sistema", "Engenharia social usando uma quebra de padrão do remetente", "Um erro comum de digitação", "Um presente da empresa"], 
        correct: 1 
    },
    { 
        q: "Qual o maior risco de conectar um pendrive encontrado no pátio da empresa no seu computador corporativo?", 
        options: ["O pendrive estar cheio e travar o PC", "Comprometer toda a rede da empresa com um software malicioso", "Perder os arquivos que estão no pendrive", "O Windows não reconhecer o dispositivo"], 
        correct: 1 
    }
];

let currentIndex = 0;
let answers = [];
let deviceID = "";

// INICIALIZAÇÃO
async function init() {
    getOrSetDeviceID();
    
    try {
        // Verifica se este ID já respondeu o questionário
        const { data, error } = await supabaseClient
            .from('questionario_resiliencia')
            .select('acertos')
            .eq('device_id', deviceID)
            .maybeSingle();

        if (data) {
            // Se já respondeu, pula direto para a tela de resultados
            mostrarResultadoFinal(data.acertos, true);
            return;
        }
    } catch (e) {
        console.error("Erro na checaagem inicial:", e);
    }

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
            // Se o banco rejeitar por duplicidade (Constraint unique_device_id)
            if (error.code === '23505' || error.message.includes('unique_device_id')) {
                alert("Você já participou deste questionário!");
                window.location.reload();
                return;
            }
            throw error;
        }

        mostrarResultadoFinal(hits, false);
        
    } catch (err) {
        console.error("Erro ao salvar:", err);
        // Fallback para caso o ID já exista mas o código de erro mude
        if (err.message && err.message.includes('unique_device_id')) {
            alert("Você já participou!");
            window.location.reload();
        } else {
            alert("Erro ao salvar resultados. Verifique sua conexão.");
        }
    }
}

async function mostrarResultadoFinal(hits, jaRespondeu) {
    document.getElementById('progress-bar').style.width = `100%`;
    document.getElementById('quiz-flow').classList.add('hidden');
    document.getElementById('result-area').classList.remove('hidden');
    
    const msgArea = document.getElementById('user-score-msg');
    if (jaRespondeu) {
        msgArea.innerHTML = `<strong>Aviso:</strong> Você já enviou suas respostas anteriormente. Sua pontuação foi ${hits} acertos.`;
    } else {
        msgArea.innerText = `Parabéns! Você acertou ${hits} de ${questions.length} questões.`;
    }
    
    await fetchGlobalStats();
}

async function fetchGlobalStats() {
    try {
        const { data, error } = await supabaseClient.from('questionario_resiliencia').select('*');
        if (error) throw error;
        if (!data || data.length === 0) return;

        const totalUsers = data.length;
        const totalPossibleHits = totalUsers * questions.length;
        const totalHits = data.reduce((sum, row) => sum + row.acertos, 0);
        const accuracy = ((totalHits / totalPossibleHits) * 100).toFixed(1);

        document.getElementById('total-participants').innerText = totalUsers;
        document.getElementById('global-accuracy').innerText = accuracy + '%';
        
        const errorElem = document.getElementById('global-errors');
        if (errorElem) errorElem.innerText = (100 - accuracy).toFixed(1) + '%';

        let errorFreq = {};
        data.forEach(row => {
            if (row.perguntas_erradas) {
                row.perguntas_erradas.forEach(idx => {
                    errorFreq[idx] = (errorFreq[idx] || 0) + 1;
                });
            }
        });

        const keys = Object.keys(errorFreq);
        if (keys.length > 0) {
            const mostMissedIdx = keys.reduce((a, b) => errorFreq[a] > errorFreq[b] ? a : b);
            const mostMissedText = document.getElementById('most-missed-text');
            if (mostMissedText) mostMissedText.innerText = `"${questions[mostMissedIdx].q}"`;
        }
    } catch (err) {
        console.error("Erro ao buscar estatísticas:", err);
    }
}

init();