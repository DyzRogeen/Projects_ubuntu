using System;

namespace MyAdminStation.Models
{
    public class BatteryStat
    {
        public int id { get; set; }
        public DateTime record_time { get; set; }
        public int percents { get; set; }
        public bool charging { get; set; }
    }
}