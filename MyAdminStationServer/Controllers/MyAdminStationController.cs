using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MyAdminStation.Data;
using System.Linq.Expressions;
using System.Net.Http.Json;

namespace MyAdminStation.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MetricsController : ControllerBase
    {

        private readonly HttpClient _httpClient;

        private readonly MyDbContext _context;

        private readonly string URL_AGENT = "http://host.docker.internal:5001";

        public MetricsController(IHttpClientFactory httpClientFactory, MyDbContext context)
        {
            _httpClient = httpClientFactory.CreateClient();
            _context = context;
        }

        [HttpGet("system")]
        public async Task<IActionResult> CollectSystemMainInfos()
        {
            try
            {
                var infos = await _httpClient.GetFromJsonAsync<object>(String.Format("{0}/system", URL_AGENT));

                var since = DateTime.UtcNow.AddHours(-5);
                var battery_stats = await _context.BatteryStats
                    .Where(b => b.record_time >= since)
                    .OrderBy(b => b.record_time)
                    .ToListAsync();

                return Ok(new { infos, battery_stats });
            }
            catch (Exception e)
            {
                return StatusCode(500, new { error = e.Message });
            }
        }

        [HttpGet("processes")]
        public async Task<IActionResult> CollectProcesses()
        {
            try
            {
                List<Process>? processes = await _httpClient.GetFromJsonAsync<List<Process>>(String.Format("{0}/processes", URL_AGENT));

                if (processes == null) return StatusCode(500, new { error = "NULL List of process" });
                return Ok(processes);
            }
            catch (Exception e)
            {
                return StatusCode(500, new { error = e.Message });
            }

        }

        [HttpGet("processes/metrics")]
        public async Task<IActionResult> CollectProcessesMetrics()
        {
            try
            {
                var metrics = await _httpClient.GetFromJsonAsync<object>(String.Format("{0}/processes/metrics", URL_AGENT));

                if (metrics == null) return StatusCode(500, new { error = "NULL metrics" });

                return Ok(metrics);
            }
            catch (Exception e)
            {
                return StatusCode(500, new { error = e.Message });
            }
        }

        [HttpGet("processes/{pid}")]
        public async Task<IActionResult> GetProcessInfos(int pid)
        {
            try
            {
                var process = await _httpClient.GetFromJsonAsync<object>(String.Format("{0}/processes/info/{1}", URL_AGENT, pid));
                return Ok(process);
            }
            catch (Exception e)
            {
                return StatusCode(500, new { error = e.Message });
            }
        }

        [HttpDelete("processes/{pid}")]
        public async Task<IActionResult> KillProcess(int pid)
        {
            try
            {
                await _httpClient.DeleteFromJsonAsync<object>(String.Format("{0}/processes/delete/{1}", URL_AGENT, pid));
                return Ok();
            }
            catch (Exception e)
            {
                return StatusCode(500, new { error = e.Message });
            }
        }

        [HttpGet("network")]
        public async Task<IActionResult> CollectPackets()
        {
            try
            {
                var packets = await _httpClient.GetFromJsonAsync<object>(String.Format("{0}/network", URL_AGENT));
                return Ok(packets);
            }
            catch (Exception e)
            {
                return StatusCode(500, new { error = e.Message });
            }
        }

        [HttpGet("network/stop")]
        public async Task<IActionResult> StopSniffing()
        {
            try
            {
                await _httpClient.GetFromJsonAsync<object>(String.Format("{0}/network/stop", URL_AGENT));
                return Ok();
            }
            catch (Exception e)
            {
                return StatusCode(500, new { error = e.Message });
            }
        }
        
        [HttpDelete("network/clear")]
        public async Task<IActionResult> ClearPackets()
        {
            try
            {
                await _httpClient.DeleteAsync(String.Format("{0}/network", URL_AGENT));
                return Ok();
            }
            catch (Exception e)
            {
                return StatusCode(500, new { error = e.Message });
            }
        }

    }

    public class Process
    {
        public int pid { get; set; }
        public string? name { get; set; }
        public double cpu_percent { get; set; }
        public double memory_percent { get; set; }
    }
}
