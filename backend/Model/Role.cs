using System.ComponentModel.DataAnnotations.Schema;

namespace solexp.Model
{
    public class Role
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id_role { get; set; }
        public string? role_name { get; set; }
        public string? description { get; set; }
    }
}
