defmodule PhoenixDapp.Repo do
  use Ecto.Repo,
    otp_app: :phoenix_dapp,
    adapter: Ecto.Adapters.Postgres
end
