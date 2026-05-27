using System.ComponentModel.DataAnnotations.Schema;

namespace solexp.Model
{
    public class User
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id_user { get; set; }
        public int id_role { get; set; }
        public string? email { get; set; }
        public string? password { get; set; }
    }
}
