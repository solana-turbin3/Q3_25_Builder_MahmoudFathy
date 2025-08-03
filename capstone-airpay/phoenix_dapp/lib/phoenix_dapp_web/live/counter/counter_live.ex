defmodule PhoenixDappWeb.CounterLive do
  use PhoenixDappWeb, :live_view


  def mount(_params, _session, socket) do
    {:ok, assign(socket,
      count: 0,
      message: "",
      sol_balance: nil,
      loading_balance: false,
      balance_error: nil,
      current_account: @solana_account,
      custom_account: ""
    )}
  end

  def handle_event("increment", _params, socket) do
    {:noreply, assign(socket, count: socket.assigns.count + 1)}
    new_count = socket.assigns.count + 1
    socket = assign(socket, count: new_count)

    # Push an event to JavaScript
    socket = if rem(new_count, 5) == 0 do
      push_event(socket, "counter-updated", %{count: new_count, milestone: true})
    else
      socket
    end

    {:noreply, socket}
  end

  def handle_event("decrement", _params, socket) do
    {:noreply, assign(socket, count: socket.assigns.count - 1)}
  end

  def handle_event("js-message", %{"message" => message}, socket) do
    {:noreply, assign(socket, message: message)}
  end

  # Handle the loading state from JavaScript
  def handle_event("solana-balance-loading", %{"loading" => loading}, socket) do
    socket = assign(socket, loading_balance: loading)
    {:noreply, socket}
  end

  # Handle the balance result from JavaScript
  def handle_event("solana-balance-result", params, socket) do
    socket = case params do
      %{"success" => true, "balance" => balance, "account" => account} ->
        assign(socket,
          sol_balance: balance,
          loading_balance: false,
          balance_error: nil,
          current_account: account
        )

      %{"success" => false, "error" => error, "account" => account} ->
        assign(socket,
          sol_balance: nil,
          loading_balance: false,
          balance_error: error,
          current_account: account
        )

      %{"success" => false, "error" => error} ->
        assign(socket,
          sol_balance: nil,
          loading_balance: false,
          balance_error: error
        )
    end

    {:noreply, socket}
  end

  def render(assigns) do
    ~H"""
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">LiveView Counter with JS Interop</h1>

      <div class="mb-6">
        <p class="text-xl">Count: <%= @count %></p>
        <div class="flex gap-2 mt-2">
          <button phx-click="decrement" class="bg-red-500 text-white px-4 py-2 rounded">-</button>
          <button phx-click="increment" class="bg-green-500 text-white px-4 py-2 rounded">+</button>
        </div>
      </div>

      <div class="mb-6">
        <h2 class="text-xl font-semibold mb-2">JS Interop Demo</h2>
        <p>Message from JS: <span id="message-display"><%= @message %></span></p>
        <button phx-hook="Counter" id="js-button" class="bg-blue-500 text-white px-4 py-2 rounded mt-2">
          Send Message from JS
        </button>
      </div>

      <div class="mb-6 p-4 border rounded-lg bg-gray-50">
        <h2 class="text-xl font-semibold mb-2">Solana Balance Checker (JavaScript Client)</h2>
        <p class="text-sm text-gray-600 mb-2">Network: Devnet</p>

        <!-- Default Account Balance -->
        <div class="mb-4 p-3 bg-white rounded border">
          <button
            phx-hook = "GetBalance"
            id="get-sol-balance-js"
            disabled={@loading_balance}
            class="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors"
          >
            <%= if @loading_balance, do: "Loading...", else: "Get Balance (JS)" %>
          </button>
        </div>
      </div>
    </div>
    """
  end
end
