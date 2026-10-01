# Templates de e-mail — onde colar

No painel do Supabase: **Authentication → Emails → Templates**.
Para cada um, cole o HTML do arquivo e ajuste o assunto. Todos usam
`{{ .Token }}` (o código de 6 dígitos) e **nenhum** tem link de ação.

| Template no painel      | Arquivo                | Assunto                                       |
| ----------------------- | ---------------------- | --------------------------------------------- |
| Confirm signup          | `confirm-signup.html`  | Seu código de confirmação – Nice One          |
| Magic Link              | `magic-link.html`      | Seu código de acesso – Nice One               |
| Reset Password          | `reset-password.html`  | Código para redefinir sua senha – Nice One    |
| Change Email Address    | `change-email.html`    | Confirme seu novo e-mail – Nice One           |

> **Importante:** remova o `{{ .ConfirmationURL }}` dos templates padrão. Se ele
> continuar no corpo do e-mail, o aluno clica no link em vez de digitar o código
> e cai justamente nos problemas de redirecionamento que este projeto evita.

O template **Magic Link** é o usado no login por código — mesmo o site não
oferecendo login por link.
