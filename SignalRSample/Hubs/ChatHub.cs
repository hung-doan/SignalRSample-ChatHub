using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SignalRSample.Hubs
{
    public class RegisterationRequest
    {
        public string Name { get; set; }
    }
    public class RegisterationResponse
    {
        public string Name { get; set; }
        public string Id { get; set; }
    }

    public class MessageInfo
    {
        public string Message { get; set; }
        public string UserId { get; set; }
        public string Name { get; set; }
    }

    public class ChatHub : Hub
    {
        [HubMethodName("register")]
        public async Task Register(RegisterationRequest req)
        {
            var info = new RegisterationResponse
            {
                Name = req.Name,
                Id = Guid.NewGuid().ToString().ToLower()
            };

            await Clients.Caller.SendAsync("registerSuccess", info);
            await Clients.All.SendAsync("register", info);
        }

        [HubMethodName("send")]
        public Task Send(MessageInfo data)
        {
            return Clients.All.SendAsync("send", data);
        }
    }
}
