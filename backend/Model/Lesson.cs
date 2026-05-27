using System.ComponentModel.DataAnnotations.Schema;

namespace solexp.Model
{
    public class Lesson
    {
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int id_lesson { get; set; }
        public int id_teacher { get; set; }
        public int id_course { get; set; }
        public DateTime? lesson_date { get; set; }
        public int? duration_min { get; set; }
        public int? number_in_course { get; set; }
        public string? title { get; set; }
        public string? description { get; set; }
        public string? homework { get; set; }
        public string? status { get; set; }
        public string? classroom { get; set; }

    }
}
