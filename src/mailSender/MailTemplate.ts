
interface EmailTemplateProps {
    username: string;
    code: string;
}

const EmailTemplate = ({
    username,
    code
}: EmailTemplateProps): string => (
    `<html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Welcome to Silent Whisper</title>
      </head>
      <body style={{
        backgroundColor: '#ffffff',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        margin: 0,
        padding: 0,
      }}>
        <table width="100%" cellPadding="0" cellSpacing="0" style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
          <tr>
            <td>
              <h1 style={{
                color: '#333333',
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '20px',
                textAlign: 'center',
              }}>
                Welcome to Silent Whisper
              </h1>
              <p style={{
                color: '#333333',
                fontSize: '16px',
                lineHeight: '24px',
                marginBottom: '20px',
              }}>
                Hello user ${username},
              </p>
              <p style={{
                color: '#333333',
                fontSize: '16px',
                lineHeight: '24px',
                marginBottom: '20px',
              }}>
                Congratulations on registering on Silent Whisper!
              </p>
              <p style={{
                color: '#333333',
                fontSize: '16px',
                lineHeight: '24px',
                marginBottom: '10px',
              }}>
                Your code is:
              </p>
              <p style={{
                backgroundColor: '#f4f4f4',
                borderRadius: '4px',
                color: '#333333',
                fontSize: '21px',
                fontWeight: 'bold',
                padding: '12px 24px',
                textAlign: 'center',
                margin: '0 auto',
                maxWidth: '200px',
              }}>
                ${code}
              </p>
            </td>
          </tr>
        </table>
      </body>
    </html>`
);

export default EmailTemplate;

