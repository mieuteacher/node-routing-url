var http = require('http');
var url = require('url');
var axios = require('axios');

http.createServer(async function (req, res) {
  var pathObj = url.parse(req.url, true);

  if (pathObj.pathname == '/') {

    if (req.method == 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/html' });

      let result;
      if (pathObj.query.type == "chat") {
        if (pathObj.query.question) {
          result = await generateText(pathObj.query.question)
          .then(res => res)
          .catch((er) => "Lỗi đường truyền")
        }else {
          result = "Vui lòng thử lại!"
        }
      }else {
        if (pathObj.query.question) {
          result = await generateImage(pathObj.query.question)
          .then(res => res)
          .catch((er) => "Lỗi đường truyền")
        }else {
          result = "Vui lòng thử lại!"
        }
      }



      res.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <title>Trang chủ</title>
          <script>
            function handleSubmit(event) {
              event.preventDefault();
              const url = "/?question=" + event.target.question.value + "&type=chat";
              window.location.href = url;
            }

            function handleSubmitImg(event) {
              event.preventDefault();
              const url = "/?question=" + event.target.question.value + "&type=img";
              window.location.href = url;
            }
          </script>
        </head>
        <body>
          <h1>Xin chào từ Node.js! - CHAT GPT FAKE</h1>
          <br>
          <pre>
            Yêu cầu của bạn: ${pathObj.query.question}
          </pre>
          <br>
          <form onsubmit="handleSubmit(event)">
            <input style="width: 1024px" name="question" type="text" placeholder="Bạn muốn hỏi gì?">
            <button type="submit">Hỏi</button>
            <br>
            <span style="max-width: 1024px">
              Gợi ý từ tôi:
              <br>
              <pre>
              ${result}
              </pre>
            </span>
          </form>
          
          <form onsubmit="handleSubmitImg(event)">
            <input style="width: 1024px" name="question" type="text" placeholder="Mô tả hình ảnh...">
            <button type="submit">Tạo ảnh theo mô tả</button>
            <br>
            <img width="400px" height="400px" src="${result}" alt="Lỗi rồi">
          </form>
        </body>
        </html>
      `);

      res.end(); // kết thúc phản hồi

      console.log("res abc", res)
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/html' });
    res.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Trang không tồn tại</title>
      </head>
      <body>
        <h1>Trang không tồn tại.</h1>
        <a href="/">Quay lại</a>
      </body>
      </html>
    `);
    res.end();
  }

}).listen(2912); // server object lắng nghe trên cổng 2912

const apiKey = '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';

async function generateText(prompt) {
  // Set up your API key and the API endpoint URL
  const endpoint = 'https://api.openai.com/v1/completions';

  // Define the request payload
  const data = {
    prompt: prompt,
    max_tokens: 500,
    temperature: 0.7,
    model: "text-davinci-003",
  };

  try {
    // Make the request to the API
    const response = await axios.post(endpoint, data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ` + apiKey,
      },
    });

    // Get the generated text from the response
    const generatedText = response.data.choices[0].text;

    // Return the generated text
    return generatedText;
  } catch (error) {
      //console.log("loi", error.response.status)
    if (error.response.status === 429) {
      const resetTime = 1;
      const resetTimeInMilliseconds = resetTime * 1000;
      console.log(`Rate limit exceeded. Pausing for ${resetTime} seconds...`);
      await new Promise(resolve => setTimeout(resolve, resetTimeInMilliseconds));
      return generateText(prompt);
    } else {
      // Otherwise, throw the error
      throw error;
    }
  }
}

async function generateImage(prompt) {
  // Set up your API key and the API endpoint URL
  const endpoint = 'https://api.openai.com/v1/images/generations';

  // Define the request payload
  const data = {
    prompt: prompt,
    n: 1,
    size: "1024x1024"
  };

  try {
    // Make the request to the API
    const response = await axios.post(endpoint, data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ` + apiKey,
      },
    });
    return response.data.data[0].url;
  } catch (error) {
      return "Tạo ảnh thất bại, liên hệ adm Miêu để fix lỗi!"
  }
}