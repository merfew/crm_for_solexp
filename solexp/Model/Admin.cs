using System.ComponentModel.DataAnnotations.Schema;

namespace solexp.Model
{
    public class Admin
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id_admin { get; set; }
        public int id_user { get; set; }
        public string? phone_number { get; set; }
        public string? full_name { get; set; }
    }
}
