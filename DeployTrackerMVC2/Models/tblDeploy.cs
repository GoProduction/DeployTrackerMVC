//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace DeployTrackerMVC2.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class tblDeploy
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public tblDeploy()
        {
            this.tblComments = new HashSet<tblComment>();
        }
    
        public int depID { get; set; }
        public Nullable<int> depVID { get; set; }
        public string depFeature { get; set; }
        public string depVersion { get; set; }
        public Nullable<System.DateTime> depPlannedDate { get; set; }
        public Nullable<System.DateTimeOffset> depPlannedTime { get; set; }
        public Nullable<System.DateTimeOffset> depStartTime { get; set; }
        public Nullable<System.DateTimeOffset> depEndTime { get; set; }
        public string depStatus { get; set; }
        public string depEnvironment { get; set; }
        public Nullable<bool> depLocked { get; set; }
        public Nullable<int> noteID { get; set; }
        public string depSmoke { get; set; }
        public Nullable<int> depTimeDiff { get; set; }
    
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<tblComment> tblComments { get; set; }
        public virtual tblNote tblNote { get; set; }
    }
}
