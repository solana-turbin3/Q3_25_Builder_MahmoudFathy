defmodule PhoenixDapp.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      PhoenixDappWeb.Telemetry,
      PhoenixDapp.Repo,
      {DNSCluster, query: Application.get_env(:phoenix_dapp, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: PhoenixDapp.PubSub},
      # Start the Finch HTTP client for sending emails
      {Finch, name: PhoenixDapp.Finch},
      # Start a worker by calling: PhoenixDapp.Worker.start_link(arg)
      # {PhoenixDapp.Worker, arg},
      # Start to serve requests, typically the last entry
      PhoenixDappWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: PhoenixDapp.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    PhoenixDappWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
