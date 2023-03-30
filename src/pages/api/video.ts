import type { APIRoute } from "astro";
import * as fs from "fs/promises";
import * as fsSync from "fs";
import path from "path";

import { Readable } from "stream";
import { finished } from "stream/promises";
import type { ReadableStream } from "stream/web";

const maujoa = await (
  await fetch(`${import.meta.env.BASE_PATH}/Maujoa.png`)
).blob();
const maujoaMask = await (
  await fetch(`${import.meta.env.BASE_PATH}/MaujoaMask.png`)
).blob();

async function generateScript(title: string) {
  console.log("entrou na geração de script");
  let headersList = {
    Accept: "*/*",
    Authorization: `Bearer ${import.meta.env.OPENAI_KEY}`,
    "Content-Type": "application/json",
  };

  let bodyContent = JSON.stringify({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: "Você é um assistente de escrita criativa." },
      {
        role: "user",
        content: `Maujoa é um YouTuber adolescente maneiro que conta histórias engraçadas da sua vida de forma divertida e com detalhes. Ele narra suas histórias em primeira pessoa e, para se organizar melhor, escreve seus roteiros com um formato bem específico.\n\nCada linha do roteiro é uma fala. Junto com cada fala, Maujoa pode fazer uma pose/emoção, ou mostrar uma imagem na tela.\n\nQuando Maujoa quer fazer uma pose, ele escreve uma linha com o seguinte formato:\n\n\`\`\`\n<pose: $DESCRIÇÃO_DA_POSE_EM_INGLÊS> $FALA_EM_PORTUGUÊS\n\`\`\`\n\nPor exemplo, quando Maujoa for dar um olá para os seus inscritos, ele pode estar feliz e acenando. Então, a linha pode ser escrita assim:\n\n\`\`\`\n<pose: happy waving> Olá meus inscritos, de boa?\n\`\`\`\n\nQuando Maujoa quer mostrar uma imagem na tela, ele escreve uma linha com o seguinte formato:\n\n\`\`\`\n<image: $DESCRIÇÃO_DA_IMAGEM_EM_INGLÊS> $FALA_EM_PORTUGUÊS\n\`\`\`\n\nPor exemplo, se Maujoa quiser dar a sua opinião sobre chocolate enquanto mostra uma imagem de um chocolate na tela, a linha pode ser escrita assim:\n\n\`\`\`\n<image: chocolate bar> Eu adoro chocolate, comeria todos os dias se não engordasse.\n\`\`\`\n\nMaujoa segue algumas regras ao fazer um roteiro:\n\n- Todas as linhas **precisam** ter uma anotação de pose ou imagem antes da fala em si.\n- Poses ou imagens podem repetir mas é bom que não se repitam muito seguidamente.\n- Descrições de imagens e poses podem ser tão longas ou tão curtas quanto quiser, porém elas **sempre** devem ter alguma relação com a sua próxima fala.\n- Suas histórias sempre envolvem algum tipo de conflito causado pelo acaso, ingenuidade, ou má sorte, e que são resolvidos de um jeito inexplicável ou fora do comum.\n- Mesmo que as histórias possam ter um final feliz, Maujoa não gosta de lições de moral e não as inclui em seus roteiros.\n\nAqui vai um exemplo de um roteiro completo para um vídeo do Maujoa com o título "O dia que fiquei preso no banheiro":\n\n\`\`\`\n<pose: happy waving> E aí! Beleza?\n<pose: explaining> Então, antes de começar esse vídeo...\n<image: youtube gaming channel> Eu não sei se vocês são novos mas eu tenho um canal de games.\n<image: Maujoa behind bars in a bathroom> Então eu vou contar o dia que fiquei PRESO NO BANHEIRO.\n<image: 2014> o ano era de 2014.\n<image: 2015> ou 2015?\n<pose: shrugging> Não lembro. Bem...\n<image: Maujoa in class> Era um dia de aula qualquer,\n<image: Maujoa in class raising his hand> e eu pedi à professora para ir ao banheiro.\n<pose: walking> E eu fui ao banheiro.\n<image: two bathroom doors> O banheiro masculino era mais ou menos assim.\n<image: pointing to a toilet> O da esquerda ficava o vaso sanitário...\n<image: pointing to a urinal> e o da direita ficava o de mijar. E eu fui no da direita.\n<image: locked bathroom door> Eu entrei no banheiro e eu tranquei a porta.\n<image: bathroom window> No banheiro tinha uma janela na frente.\n<image: stupid stick figure> Uhhhhhhh... por que você não saiu pela janela?\n<pose: angry> Como é que eu vou conseguir sair pela janela??\n<pose: using the bathroom> Enfim, eu dei uma mijada e quando eu ia sair...\n<image: stuck lock on door> ...o trinque ficou PRESO.\n<pose: screaming> E, eu não consegui.\n<pose: punching bathroom door> E, eu não consegui.\n<image: guy looking through bathroom window> Apareceu um cara na janela e nem lembro se ele era faxineiro.\n<image: talking guy looking through bathroom window> Ele falou pra eu puxar o trinque.\n<image: stuck lock on door> Eu fiz isso segunda vez...\n<pose: worried> E, eu não consegui.\n<pose: mortified talking> Veio uma mulher, e ela tava conversando comigo. E eu nem lembro como é que era o assunto.\n<pose: thinking> Eu fiquei preso no banheiro acho queeeeeee... meia hora.\n<image: bathroom door opening> Mano, a porta abriu, de um jeito que eu não lembro. E eu saí do banheiro.\n<pose: talking> Quando eu saio, vejo um monte de...\n<image: a bunch of people> monitoras, professoras, diretoras, e sei lá o que.\n<pose: talking> E depois disso eu NUNCA MAIS tranquei a porta do banheiro.\n<pose: talking> E depois de alguns anos eu voltei a trancar a porta do banheiro eeeee... eu não fiquei preso. Eu botava pé na porta quando eu vinha no banheiro.\n<pose: happy> Então galera! Esse foi o vídeo, espero que tenham gostado da história. Se vocês gostaram não esquece de deixar o seu like, inscreva-se no canal, ativa o sininho, compartilhe para todos os seus amigos e inscreva-se no meu canal de jogos também.\n<pose: happy> E falous galera...\n<pose: happy waving> Fui!\n\`\`\`\n\nAgora, crie um novo roteiro de vídeo para Maujoa, seguindo o formato explicado acima, baseado no título "${title}". Seja livre para usar a sua criatividade para criar uma história maluca ou fantasiosa! Só lembre-se de seguir o assunto dado pelo título do vídeo, que é "${title}". Mesmo se o título não fizer sentido lógico ou gramatical, você precisa gerar um roteiro.`,
      },
    ],
  });

  let response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    body: bodyContent,
    headers: headersList,
  });

  const body = await response.json();

  if (!response.ok) {
    await fs.writeFile(
      path.resolve(
        process.cwd(),
        "public/logs",
        "script_" +
          new Date()
            .toLocaleString()
            .replace(/\//g, "-")
            .replace(/, /, "-")
            .replace(/:/g, "_")
      ),
      JSON.stringify(body),
      "utf-8"
    );

    throw new Error("Erro ao gerar script.");
  }

  return body.choices[0].message.content;
}

async function generatePose(pose: string) {
  let headersList = {
    Accept: "*/*",
    Authorization: `bearer ${import.meta.env.OPENAI_KEY}`,
  };

  let bodyContent = new FormData();
  bodyContent.append(
    "prompt",
    `Drawing of a humanoid character who is ${pose}.`
  );
  bodyContent.append("n", "1");
  bodyContent.append("size", "512x512");
  bodyContent.append("image", maujoa);
  bodyContent.append("mask", maujoaMask);

  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    body: bodyContent,
    headers: headersList,
  });
  const body = await response.json();

  if (!response.ok) {
    await fs.writeFile(
      path.resolve(
        process.cwd(),
        "public/logs",
        "pose_" +
          new Date()
            .toLocaleString()
            .replace(/\//g, "-")
            .replace(/, /, "-")
            .replace(/:/g, "_")
      ),
      JSON.stringify(body),
      "utf-8"
    );

    throw new Error("Erro ao gerar imagem.");
  }

  return await fetch(body.data[0].url);
}

async function generateImage(image: string) {
  let headersList = {
    Accept: "*/*",
    Authorization: `bearer ${import.meta.env.OPENAI_KEY}`,
    "Content-Type": "application/json",
  };

  let bodyContent = JSON.stringify({
    prompt: `MS Paint drawing of ${image
      .toLowerCase()
      .replace(/maujoa/g, "green-haired boy")}.`,
    n: 1,
    size: "512x512",
  });

  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    body: bodyContent,
    headers: headersList,
  });
  const body = await response.json();

  if (!response.ok) {
    await fs.writeFile(
      path.resolve(
        process.cwd(),
        "public/logs",
        "image_" +
          new Date()
            .toLocaleString()
            .replace(/\//g, "-")
            .replace(/, /, "-")
            .replace(/:/g, "_")
      ),
      JSON.stringify(body),
      "utf-8"
    );

    throw new Error("Erro ao gerar imagem.");
  }

  return await fetch(body.data[0].url);
}

async function generateAudio(text: string) {
  let headersList = {
    Accept: "audio/mpeg",
    "xi-api-key": import.meta.env.ELEVENLABS_KEY,
    "Content-Type": "application/json",
  };

  let bodyContent = JSON.stringify({
    text,
    voice_settings: {
      stability: 0,
      similarity_boost: 0.8,
    },
  });

  let response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${import.meta.env.VOICE_ID}`,
    {
      method: "POST",
      body: bodyContent,
      headers: headersList,
    }
  );

  if (!response.ok) {
    await fs.writeFile(
      path.resolve(
        process.cwd(),
        "public/logs",
        "audio_" +
          new Date()
            .toLocaleString()
            .replace(/\//g, "-")
            .replace(/, /, "-")
            .replace(/:/g, "_")
      ),
      JSON.stringify(response.statusText),
      "utf-8"
    );

    throw new Error("Erro ao gerar áudio.");
  }

  return response;
}

export const post: APIRoute = async ({ request }) => {
  const requestBody = await request.json();
  const title = requestBody.title;
  if (!title) {
    return {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Title is required",
      }),
    };
  }

  const slug = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^A-Z\d]/gi, "");

  // Teste se a pasta do video existe, senão, crie-a.
  try {
    await fs.stat(path.resolve(process.cwd(), "public", slug));
  } catch (error) {
    await fs.mkdir(path.resolve(process.cwd(), "public", slug));
  }

  // Teste se a pasta de logs existe, senão, crie-a.
  try {
    await fs.stat(path.resolve(process.cwd(), "public", "logs"));
  } catch (error) {
    await fs.mkdir(path.resolve(process.cwd(), "public", "logs"));
  }

  if (!requestBody.regenerateJson) {
    // Teste se o json do video existe. Se sim, não gere novamente.
    try {
      await fs.stat(path.resolve(process.cwd(), "public", slug, "video.json"));
      return new Response(
        JSON.stringify({
          slug,
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    } catch (error) {
      console.log("Um novo vídeo será gerado!");
    }
  }

  console.log("Passou do check de regerar json");

  // Teste se o script do vídeo existe, senão, gere-o.
  try {
    console.log("tentando obter script");
    await fs.stat(path.resolve(process.cwd(), "public", slug, "script.txt"));
  } catch (error) {
    console.log("nao tem script");
    try {
      console.log("tentando gerar script");
      const newScript = await generateScript(title);
      await fs.writeFile(
        path.resolve(process.cwd(), "public", slug, "script.txt"),
        newScript,
        "utf-8"
      );
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: "Houve um erro ao gerar o script do vídeo. Cheque os logs.",
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
          status: 500,
        }
      );
    }
  }

  // Carregue o script do vídeo
  const script = await fs.readFile(
    path.resolve(process.cwd(), "public", slug, "script.txt"),
    {
      encoding: "utf-8",
    }
  );

  // Limpe o script do vídeo e separe as linhas
  const lines = script
    .slice(script.indexOf("<"))
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line !== "" && line.includes("<") && line.includes(">"));

  // Crie o template do JSON final
  type Scene = {
    image: string | null;
    audio: string | null;
    type: "image" | "pose";
    imageDescription: string;
    text: string;
  };
  type Video = {
    title: string;
    scenes: Scene[];
  };
  const video: Video = {
    title,
    scenes: lines.map((line) => {
      return {
        image: null,
        type: line.startsWith("<pose: ")
          ? "pose"
          : line.startsWith("<image: ")
          ? "image"
          : "image",
        imageDescription: line.slice(line.indexOf(": ") + 2, line.indexOf(">")),
        audio: null,
        text: line.slice(line.indexOf(">") + 2),
      };
    }),
  };

  // Gere as imagens e salve-as.
  // const imagePromises = await Promise.allSettled(imageRequests);
  let i = 0;
  for (const scene of video.scenes) {
    // Teste se a imagem existe, senão, crie-a.
    try {
      await fs.stat(
        path.resolve(process.cwd(), "public", slug, "image_" + i + ".png")
      );
      console.log(`imagem ${i} já existe, pulando...`);
      scene.image = `/${slug}/image_${i}.png`;
    } catch (e) {
      try {
        console.log(`!!!TENTANDO GERAR IMAGEM ${i}`);
        const response =
          scene.type === "pose"
            ? await generatePose(scene.imageDescription)
            : await generateImage(scene.imageDescription);

        const stream = fsSync.createWriteStream(
          path.resolve(process.cwd(), "public", slug, `image_${i}.png`)
        );
        const { body } = response;
        await finished(
          Readable.fromWeb(body as ReadableStream<any>).pipe(stream)
        );

        scene.image = `/${slug}/image_${i}.png`;
      } catch (error) {
        console.log(`Falha ao gerar imagem ` + i);
      }
    }

    i++;
  }

  // Extraia todos os áudios necessários
  i = 0;
  for (const scene of video.scenes) {
    // Teste se o áudio existe, senão, crie-o.
    try {
      await fs.stat(
        path.resolve(process.cwd(), "public", slug, "audio_" + i + ".mp3")
      );
      console.log(`áudio ${i} já existe, pulando...`);
      scene.audio = `/${slug}/audio_${i}.mp3`;
    } catch (e) {
      try {
        console.log(`!!!TENTANDO GERAR ÁUDIO ${i}`);
        const response = await generateAudio(scene.text);

        const stream = fsSync.createWriteStream(
          path.resolve(process.cwd(), "public", slug, `audio_${i}.mp3`)
        );
        const { body } = response;
        await finished(
          Readable.fromWeb(body as ReadableStream<any>).pipe(stream)
        );

        scene.audio = `/${slug}/audio_${i}.mp3`;
      } catch (error) {
        console.log(`Falha ao gerar áudio ` + i);
      }
    }

    i++;
  }

  // Salve o documento do vídeo final.
  await fs.writeFile(
    path.resolve(process.cwd(), "public", slug, "video.json"),
    JSON.stringify(video),
    {
      encoding: "utf8",
    }
  );

  return new Response(
    JSON.stringify({
      slug,
    }),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};
