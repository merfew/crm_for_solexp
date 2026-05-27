using System.ComponentModel.DataAnnotations.Schema;

namespace solexp.Model
{
    public class Client
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id_client { get; set; }
        public int id_user { get; set; }
        public string? phone_number { get; set; }
        public string? full_name { get; set; }
        public decimal balance { get; set; }
    }
}
