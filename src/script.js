// グラフを描画する関数（引数に初期関数 initFunc を受け取る）
function drawGraph(initFunc) {
    const N = parseInt(document.getElementById('paramN').value);
    const lambda = parseFloat(document.getElementById('paramLambda').value);
    document.getElementById('valLambda').innerText = lambda.toFixed(2);
    document.getElementById('valN').innerText = N;

    // 空間ステップ h の定義 (x は 0 から 1 まで)
    const h = 1.0 / (N + 1);

    // 時間ステップ数（教科書のグラフの範囲 t = 0 から 0.1 に合わせる）
    const tMax = 0.1;
    const k = 1.0; // 拡散係数（例として1.0を使用）
    // λ = kτ / h^2 より、時間刻み τ を逆算
    const tau = lambda * h * h / k;
    const maxStepT = Math.floor(tMax / tau);

    // 2. 座標配列の準備
    let xValues = [];
    for (let i = 0; i <= N + 1; i++) {
        xValues.push(i * h);
    }

    let tValues = [];
    for (let n = 0; n <= maxStepT; n++) {
        tValues.push(n * tau);
    }

    // 3. 初期条件のセット (n = 0)
    // u[i][n] の構造を作る
    let u = new Array(N + 2);
    for (let i = 0; i < N + 2; i++) {
        u[i] = new Array(maxStepT + 1);
    }

    // 境界条件 (1.21b) および 初期条件 (1.21c)
    for (let n = 0; n <= maxStepT; n++) {
        u[0][n] = 0.0;
        u[N + 1][n] = 0.0;
    }
    for (let i = 1; i <= N; i++) {
        let x = i * h;
        // 【修正】引数で受け取った初期関数 (initFunc) を使って初期値を計算
        u[i][0] = initFunc(x);
    }

    // 4. 陽的スキーム (1.23) によるタイムステップのループ
    for (let n = 0; n < maxStepT; n++) {
        for (let i = 1; i <= N; i++) {
            u[i][n + 1] = (1 - 2 * lambda) * u[i][n] + lambda * (u[i - 1][n] + u[i + 1][n]);
        }
    }

    // Plotly用にデータの行列を転置 (Z[x_idx][t_idx] にする)
    // Plotlyのsurfaceは、行がY軸（ここではt）、列がX軸（ここではx）に対応します
    // 【重要修正】外側を時間(n)、内側を空間(i)のループにすることで、Plotlyの軸の仕様（行=Y軸, 列=X軸）に適合させます
    let uData = [];
    for (let n = 0; n <= maxStepT; n++) {
        let row = [];
        for (let i = 0; i <= N + 1; i++) {
            row.push(u[i][n]);
        }
        uData.push(row);
    }

    // 5. Plotly のデータとレイアウト設定
    const data = [{
        x: xValues, // X軸に位置 x
        y: tValues, // Y軸に時間 t
        z: uData,   // Z軸に解 u
        type: 'surface',
        colorscale: 'Viridis', // 学術的に見やすいカラーマップ
        colorbar: { title: 'u (温度)', titleside: 'top' }
    }];

    const layout = {
        scene: {
            xaxis: { title: 'x (位置)', range: [0, 1.0] }, // タイトルをxに変更、rangeを[0, 1.0]に修正
            yaxis: { title: 't (時間)', range: [0, 0.1] }, // タイトルをtに変更、rangeを[0, 0.1]に修正
            zaxis: { title: 'u (温度)', range: [0, 1.0] },
            // 教科書の視点に近づけるためのカメラ設定
            camera: {
                eye: { x: 0.6, y: -1.6, z: 1.2 }
            },
            aspectmode: 'manual',
            aspectratio: { x: 1, y: 1, z: 0.6 }
        },
        layout_width: 800,
        layout_height: 600,
        margin: { l: 0, r: 0, b: 0, t: 0 }
    };

    // 描画
    Plotly.newPlot('graph', data, layout);
}

// ーーー 以下に初期関数を複数定義する ーーー

// 初期関数A：例1.8（図1.4）の滑らかな連続関数
function funcA(x) {
    return x * Math.pow(Math.sin(3 * Math.PI * x), 2);
}

// 初期関数B：例1.9（図1.5）の不連続な初期関数
function funcB(x) {
    if (0 <= x && x <= 0.3) {
        return 0.3;
    } else if (0.3 < x && x <= 0.6) {
        return -2.0 * (x - 0.6);
    } else {
        return 0.6;
    }
}

// 初期関数C：サイン波（最も単純な熱拡散の例など）
function funcC(x) {
    return Math.min(x, 1 - x);
}

// 初期関数D：別のサイン波
function funcD(x) {
    return Math.sin(Math.PI * x);
}


// イベントリスナーの設定（ここでは例として funcA を指定）
document.getElementById('paramN').addEventListener('change', () => drawGraph(funcA));
document.getElementById('paramLambda').addEventListener('input', () => drawGraph(funcA));

// 初期描画（最初は funcA で描画）
drawGraph(funcA);

// 選択されている関数を判定して返す関数
function getSelectedFunction() {
    const selected = document.getElementById('funcSelect').value;
    if (selected === 'A') return funcA;
    if (selected === 'B') return funcB;
    if (selected === 'C') return funcC;
    if (selected === 'D') return funcD;
    return funcA;
}

// イベントリスナー
document.getElementById('paramN').addEventListener('change', () => drawGraph(getSelectedFunction()));
document.getElementById('paramLambda').addEventListener('input', () => drawGraph(getSelectedFunction()));
document.getElementById('funcSelect').addEventListener('change', () => drawGraph(getSelectedFunction()));

// 初期描画
drawGraph(getSelectedFunction());