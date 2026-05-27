using System.ComponentModel.DataAnnotations.Schema;

namespace solexp.Model
{
    public class Student
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id_student { get; set; }
        public int id_client { get; set; }
        public string? full_name { get; set; }
        public DateTime? birth_date { get; set; }
    }
}
